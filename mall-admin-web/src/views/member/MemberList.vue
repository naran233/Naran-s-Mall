<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="用户名 / 昵称 / 手机号" clearable style="width:240px" @keyup.enter="load" />
        <el-select v-model="status" placeholder="状态" clearable style="width:130px" @change="load">
          <el-option label="正常" :value="1" />
          <el-option label="已禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
        <el-button @click="loadLevels">刷新等级</el-button>
      </div>

      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="110" />
        <el-table-column prop="phone" label="手机号" min-width="130" />
        <el-table-column label="等级" width="110">
          <template #default="{ row }"><el-tag type="warning" effect="plain">{{ row.levelName }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="growth" label="成长值" width="90" />
        <el-table-column prop="integration" label="积分" width="80" />
        <el-table-column prop="orderCount" label="订单数" width="85" />
        <el-table-column label="累计消费" width="120">
          <template #default="{ row }">￥{{ row.totalPay }}</template>
        </el-table-column>
        <el-table-column label="状态" width="95">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button link :type="row.status === 1 ? 'danger' : 'success'" @click="toggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-drawer v-model="drawer" title="会员详情" size="500px">
      <template v-if="detail.member">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="会员ID">{{ detail.member.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ detail.member.username }}</el-descriptions-item>
          <el-descriptions-item label="昵称">{{ detail.member.nickname }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ detail.member.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ detail.member.email || '—' }}</el-descriptions-item>
          <el-descriptions-item label="成长值 / 积分">{{ detail.member.growth }} / {{ detail.member.integration }}</el-descriptions-item>
          <el-descriptions-item label="订单数 / 消费">{{ detail.orderCount }} 单 / ￥{{ detail.totalPay }}</el-descriptions-item>
          <el-descriptions-item label="注册时间">{{ detail.member.createTime }}</el-descriptions-item>
        </el-descriptions>
        <h4>最近订单</h4>
        <el-table :data="detail.recentOrders" border size="small" empty-text="暂无订单">
          <el-table-column prop="orderSn" label="订单号" min-width="150" />
          <el-table-column prop="payAmount" label="实付" width="90" />
          <el-table-column prop="createTime" label="时间" min-width="150" />
        </el-table>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getMembers, getMember, changeMemberStatus, getMemberLevels } from '../../api/admin'

const rows = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>(undefined)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const drawer = ref(false)
const detail = reactive<any>({ member: null, recentOrders: [] })
const levels = ref<any[]>([])

async function load() {
  loading.value = true
  try {
    const r: any = await getMembers({
      keyword: keyword.value, status: status.value, pageNum: pageNum.value, pageSize: pageSize.value
    })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}

async function loadLevels() {
  const r: any = await getMemberLevels()
  levels.value = r.data
  ElMessage.success(`已加载 ${levels.value.length} 个会员等级`)
}

function onPage(p: number) { pageNum.value = p; load() }

async function openDetail(row: any) {
  const r: any = await getMember(row.id)
  Object.assign(detail, r.data)
  drawer.value = true
}

async function toggleStatus(row: any) {
  const next = row.status === 1 ? 0 : 1
  await ElMessageBox.confirm(`确认${next === 1 ? '启用' : '禁用'}会员「${row.username}」？`, '提示', { type: 'warning' })
  await changeMemberStatus(row.id, next)
  ElMessage.success('操作成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
h4 { margin: 18px 0 8px; }
</style>
