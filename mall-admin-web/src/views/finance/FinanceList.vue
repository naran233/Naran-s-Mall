<template>
  <div v-loading="loading">
    <el-row :gutter="16" class="cards">
      <el-col :span="6"><el-card shadow="hover"><div class="kpi"><span>累计收款</span><b class="red">￥{{ money(overview.totalIncome) }}</b><em>{{ overview.recordCount ?? 0 }} 笔已收款</em></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="kpi"><span>今日收款</span><b>￥{{ money(overview.todayIncome) }}</b><em>本月 ￥{{ money(overview.monthIncome) }}</em></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="kpi"><span>待收款</span><b class="orange">￥{{ money(overview.pendingAmount) }}</b><em>待支付订单</em></div></el-card></el-col>
      <el-col :span="6"><el-card shadow="hover"><div class="kpi"><span>退款金额</span><b class="grey">￥{{ money(overview.refundAmount) }}</b><em>已登记退款</em></div></el-card></el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header><b>近 30 天回款趋势</b></template>
      <div ref="dailyRef" class="chart"></div>
    </el-card>

    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="订单号" clearable style="width:200px" @keyup.enter="load" />
        <el-select v-model="status" placeholder="流水状态" clearable style="width:140px" @change="load">
          <el-option label="已收款" :value="1" />
          <el-option label="已退款" :value="2" />
        </el-select>
        <el-date-picker v-model="range" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期"
                        value-format="YYYY-MM-DD" style="width:260px" @change="load" />
        <el-button type="primary" @click="load">查询</el-button>
      </div>

      <el-table :data="rows" border stripe>
        <el-table-column label="流水号" width="90">
          <template #default="{ row }">{{ row.record.id }}</template>
        </el-table-column>
        <el-table-column label="订单号" min-width="180">
          <template #default="{ row }">{{ row.record.orderSn }}</template>
        </el-table-column>
        <el-table-column label="会员" min-width="110">
          <template #default="{ row }">{{ row.memberName }}</template>
        </el-table-column>
        <el-table-column label="金额" width="120">
          <template #default="{ row }">
            <span :class="{ neg: Number(row.record.amount) < 0 }">￥{{ money(row.record.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.record.status === 1 ? 'success' : row.record.status === 2 ? 'danger' : 'warning'">
              {{ statusText(row.record.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付时间" min-width="160">
          <template #default="{ row }">{{ row.record.payTime }}</template>
        </el-table-column>
        <el-table-column label="备注" min-width="140">
          <template #default="{ row }">{{ row.record.remark }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.record.status === 1 && Number(row.record.amount) > 0"
                       link type="danger" @click="refund(row.record)">登记退款</el-button>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { getFinanceOverview, getFinanceRecords, getFinanceDaily, refundRecord } from '../../api/admin'

const overview = ref<any>({})
const rows = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>(undefined)
const range = ref<[string, string] | null>(null)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dailyRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const money = (v: any) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const statusText = (s: number) => (s === 1 ? '已收款' : s === 2 ? '已退款' : '待收款')

async function loadOverview() {
  const r: any = await getFinanceOverview()
  overview.value = r.data
}

async function loadDaily() {
  const r: any = await getFinanceDaily(30)
  const data = r.data as any[]
  if (!dailyRef.value) return
  chart = chart || echarts.init(dailyRef.value)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 30, top: 30, bottom: 40 },
    xAxis: { type: 'category', data: data.map(d => d.date.slice(5)) },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar', data: data.map(d => Number(d.amount || 0)), barWidth: '55%',
      itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] }
    }]
  }, true)
}

async function load() {
  loading.value = true
  try {
    const r: any = await getFinanceRecords({
      keyword: keyword.value, status: status.value,
      startDate: range.value?.[0], endDate: range.value?.[1],
      pageNum: pageNum.value, pageSize: pageSize.value
    })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}

function onPage(p: number) { pageNum.value = p; load() }

async function refund(record: any) {
  const { value } = await ElMessageBox.prompt(
    `对订单「${record.orderSn}」登记退款 ￥${money(record.amount)}？`, '退款登记',
    { inputPlaceholder: '退款原因（选填）', inputValue: '' }
  )
  await refundRecord(record.id, value || '管理员登记退款')
  ElMessage.success('退款已登记')
  await loadOverview()
  await load()
}

onMounted(async () => {
  await loadOverview()
  await nextTick()
  await loadDaily()
  await load()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => chart?.dispose())
</script>

<style scoped>
.cards { margin-bottom: 16px; }
.kpi { display: flex; flex-direction: column; gap: 6px; }
.kpi span { color: #909399; font-size: 13px; }
.kpi b { font-size: 24px; color: #303133; }
.kpi b.red { color: #f56c6c; }
.kpi b.orange { color: #e6a23c; }
.kpi b.grey { color: #909399; }
.kpi em { font-size: 12px; color: #c0c4cc; font-style: normal; }
.chart-card { margin-bottom: 16px; }
.chart { width: 100%; height: 280px; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
.neg { color: #67c23a; }
.muted { color: #c0c4cc; }
</style>
