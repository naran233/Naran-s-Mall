<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="订单号 / 会员ID" clearable style="width:220px" @keyup.enter="load" />
        <el-select v-model="status" placeholder="订单状态" clearable style="width:160px" @change="load">
          <el-option v-for="s in statusList" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="orderSn" label="订单号" min-width="195" />
        <el-table-column prop="memberId" label="会员ID" width="85" />
        <el-table-column label="实付" width="105">
          <template #default="{ row }">￥{{ row.payAmount }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="物流" min-width="170">
          <template #default="{ row }">
            <span v-if="row.deliverySn">{{ row.deliveryCompany }} / {{ row.deliverySn }}</span>
            <span v-else class="muted">未发货</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="165" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === 3" link type="success" @click="openDeliver(row)">发货</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-drawer v-model="drawer" title="订单详情" size="520px">
      <template v-if="detail.order">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ detail.order.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ statusText(detail.order.status) }}</el-descriptions-item>
          <el-descriptions-item label="收货人">{{ detail.order.receiverName }} / {{ detail.order.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ detail.order.receiverDetailAddress }}</el-descriptions-item>
          <el-descriptions-item label="商品总额">￥{{ detail.order.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">￥{{ detail.order.couponAmount }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">￥{{ detail.order.payAmount }}</el-descriptions-item>
          <el-descriptions-item label="物流公司">{{ detail.order.deliveryCompany || '—' }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ detail.order.deliverySn || '—' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ detail.order.deliveryTime || '—' }}</el-descriptions-item>
        </el-descriptions>
        <h4>商品明细</h4>
        <el-table :data="detail.items" border size="small">
          <el-table-column prop="productName" label="商品" min-width="140" />
          <el-table-column prop="productPrice" label="单价" width="90" />
          <el-table-column prop="productQuantity" label="数量" width="70" />
          <el-table-column prop="realAmount" label="小计" width="90" />
        </el-table>
        <h4>操作轨迹</h4>
        <el-timeline>
          <el-timeline-item v-for="h in detail.history" :key="h.id" :timestamp="h.createTime">
            {{ h.note }}（状态 {{ statusText(h.orderStatus) }}）
          </el-timeline-item>
        </el-timeline>
      </template>
    </el-drawer>

    <el-dialog v-model="deliverDialog" title="订单发货" width="440px">
      <el-form :model="deliverForm" label-width="90px">
        <el-form-item label="物流公司">
          <el-select v-model="deliverForm.deliveryCompany" style="width:100%">
            <el-option v-for="c in companies" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号">
          <el-input v-model="deliverForm.deliverySn" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deliverForm.note" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deliverDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="doDeliver">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrders, getOrderDetail, deliverOrder, deleteOrder } from '../../api/admin'

const rows = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>(undefined)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const drawer = ref(false)
const detail = reactive<any>({ order: null, items: [], history: [] })

const deliverDialog = ref(false)
const saving = ref(false)
const companies = ['顺丰速运', '京东物流', '中通快递', '圆通速递', '韵达快递', 'EMS']
const deliverForm = reactive<any>({ id: null, deliveryCompany: '顺丰速运', deliverySn: '', note: '' })

const statusList = [
  { label: '创建订单', value: 0 },
  { label: '确认订单', value: 1 },
  { label: '待支付', value: 2 },
  { label: '支付成功(待发货)', value: 3 },
  { label: '已发货', value: 4 },
  { label: '已取消', value: 5 }
]

function statusText(s: number) {
  return statusList.find(x => x.value === s)?.label || '未知'
}
function statusTag(s: number) {
  if (s === 3) return 'success'
  if (s === 4) return 'primary'
  if (s === 5) return 'info'
  if (s === 2) return 'warning'
  return 'info'
}

async function load() {
  loading.value = true
  try {
    const r: any = await getOrders({ keyword: keyword.value, status: status.value, pageNum: pageNum.value, pageSize: pageSize.value })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}

function onPage(p: number) { pageNum.value = p; load() }

async function openDetail(row: any) {
  const r: any = await getOrderDetail(row.id)
  Object.assign(detail, r.data)
  drawer.value = true
}

function openDeliver(row: any) {
  deliverForm.id = row.id
  deliverForm.deliveryCompany = '顺丰速运'
  deliverForm.deliverySn = ''
  deliverForm.note = ''
  deliverDialog.value = true
}

async function doDeliver() {
  if (!deliverForm.deliverySn) { ElMessage.warning('请填写物流单号'); return }
  saving.value = true
  try {
    await deliverOrder(deliverForm.id, {
      deliveryCompany: deliverForm.deliveryCompany,
      deliverySn: deliverForm.deliverySn,
      note: deliverForm.note
    })
    ElMessage.success('发货成功，订单已置为「已发货」')
    deliverDialog.value = false
    load()
  } finally { saving.value = false }
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除订单「${row.orderSn}」？`, '提示', { type: 'warning' })
  await deleteOrder(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
h4 { margin: 18px 0 8px; }
.muted { color: #c0c4cc; }
</style>
