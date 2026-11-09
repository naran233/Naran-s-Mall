<template>
  <div v-loading="loading">
    <el-card>
      <template #header>
        <div class="head">
          <b>我的订单</b>
          <el-radio-group v-model="status" size="small" @change="load">
            <el-radio-button label="">全部</el-radio-button>
            <el-radio-button :label="0">创建订单</el-radio-button>
            <el-radio-button :label="1">确认订单</el-radio-button>
            <el-radio-button :label="2">待支付</el-radio-button>
            <el-radio-button :label="3">待发货</el-radio-button>
            <el-radio-button :label="4">已发货</el-radio-button>
            <el-radio-button :label="5">已取消</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-empty v-if="!loading && !orders.length" description="暂无订单" />
      <div v-for="o in orders" :key="o.id" class="order">
        <div class="order-head">
          <span class="sn">订单号：{{ o.orderSn }}</span>
          <el-tag :type="tagType(o.status)">{{ statusText(o.status) }}</el-tag>
        </div>
        <div class="order-body">
          <div class="items">
            <div v-for="it in o.items" :key="it.id" class="item">
              <img :src="it.productPic" class="thumb" />
              <div>
                <div class="name">{{ it.productName }}</div>
                <div class="sub">￥{{ it.productPrice }} × {{ it.productQuantity }}</div>
              </div>
            </div>
          </div>
          <div class="amount">
            <div>总额：￥{{ o.totalAmount }}</div>
            <div>优惠：￥{{ o.couponAmount }}</div>
            <div class="pay">实付：<span>￥{{ o.payAmount }}</span></div>
          </div>
        </div>
          <div v-if="o.deliverySn" class="delivery">
            物流：{{ o.deliveryCompany }} / {{ o.deliverySn }}
            <span class="dtime">（{{ o.deliveryTime }} 已发货）</span>
          </div>
          <div class="actions">
          <el-button v-if="o.status === 0" type="primary" size="small" @click="act(o.id, 'confirm')">确认订单</el-button>
          <el-button v-if="o.status === 1" type="warning" size="small" @click="act(o.id, 'prepay')">去支付</el-button>
          <el-button v-if="o.status === 2" type="danger" size="small" @click="act(o.id, 'pay')">模拟支付</el-button>
          <el-button v-if="o.status === 3" type="success" size="small" disabled>已支付 · 待发货</el-button>
          <el-button v-if="o.status === 4" type="primary" size="small" disabled>已发货</el-button>
          <el-button v-if="o.status < 3" size="small" @click="act(o.id, 'cancel')">取消订单</el-button>
          <span class="time">{{ o.createTime }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { myOrders, confirmOrder, prepayOrder, payOrder, cancelOrder } from '../api/portal'

const orders = ref<any[]>([])
const loading = ref(false)
const status = ref<any>('')

const statusMap: any = { 0: '创建订单', 1: '确认订单', 2: '待支付', 3: '支付成功 · 待发货', 4: '已发货', 5: '已取消' }
function statusText(s: number) { return statusMap[s] || '未知' }
function tagType(s: number) {
  if (s === 3) return 'success'
  if (s === 4) return 'primary'
  if (s === 5) return 'info'
  if (s === 2) return 'warning'
  return 'info'
}

async function load() {
  loading.value = true
  try {
    const r: any = await myOrders({ status: status.value === '' ? undefined : status.value })
    orders.value = r.data
  } finally { loading.value = false }
}

async function act(id: number, type: string) {
  if (type === 'cancel') {
    await ElMessageBox.confirm('确认取消该订单？库存将被释放。', '提示', { type: 'warning' })
    await cancelOrder(id)
    ElMessage.success('已取消')
  } else if (type === 'confirm') {
    await confirmOrder(id); ElMessage.success('已确认订单')
  } else if (type === 'prepay') {
    await prepayOrder(id); ElMessage.success('已进入待支付')
  } else if (type === 'pay') {
    await payOrder(id); ElMessage.success('模拟支付成功')
  }
  load()
}

onMounted(load)
</script>

<style scoped>
.head { display: flex; justify-content: space-between; align-items: center; }
.order { border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.order-head { display: flex; justify-content: space-between; padding: 10px 16px; background: #f5f7fa; }
.sn { color: #606266; font-size: 14px; }
.order-body { display: flex; justify-content: space-between; padding: 16px; gap: 20px; }
.items { flex: 1; }
.item { display: flex; gap: 12px; margin-bottom: 10px; }
.thumb { width: 56px; height: 56px; object-fit: cover; border-radius: 6px; }
.delivery { padding: 8px 16px; background: #f0f9eb; color: #529b2e; font-size: 13px; border-top: 1px dashed #e1f3d8; }
.dtime { color: #909399; }
.name { font-size: 14px; }
.sub { font-size: 12px; color: #909399; margin-top: 4px; }
.amount { width: 180px; text-align: right; color: #606266; line-height: 1.9; font-size: 13px; }
.amount .pay span { color: #f56c6c; font-size: 18px; font-weight: 700; }
.actions { display: flex; justify-content: flex-end; align-items: center; gap: 8px; padding: 10px 16px; border-top: 1px solid #ebeef5; }
.time { color: #c0c4cc; font-size: 12px; margin-left: 12px; }
</style>
