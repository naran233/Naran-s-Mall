<template>
  <div v-loading="loading">
    <el-row :gutter="16" class="cards">
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi"><span>总销售额</span><b class="red">￥{{ money(overview.totalSales) }}</b><em>累计已支付订单</em></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi"><span>今日销售额</span><b>￥{{ money(overview.todaySales) }}</b><em>本月 ￥{{ money(overview.monthSales) }}</em></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi"><span>订单总数</span><b>{{ overview.orderCount ?? 0 }}</b><em>已支付 {{ overview.paidOrderCount ?? 0 }} 单</em></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi"><span>会员总数</span><b>{{ overview.memberCount ?? 0 }}</b><em>今日新增 {{ overview.newMemberToday ?? 0 }}</em></div></el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="cards">
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi sm"><span>在售商品</span><b>{{ overview.productCount ?? 0 }}</b></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi sm"><span>待发货订单</span><b class="orange">{{ overview.waitDeliverCount ?? 0 }}</b></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi sm"><span>待处理工单</span><b class="orange">{{ overview.pendingTicketCount ?? 0 }}</b></div></el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover"><div class="kpi sm"><span>数据范围</span><b>近 {{ days }} 天</b></div></el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header>
        <div class="card-head">
          <b>销售趋势</b>
          <el-radio-group v-model="days" size="small" @change="loadTrend">
            <el-radio-button :label="7">近 7 天</el-radio-button>
            <el-radio-button :label="30">近 30 天</el-radio-button>
            <el-radio-button :label="90">近 90 天</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendRef" class="chart tall"></div>
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><b>订单状态分布</b></template>
          <div ref="statusRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header><b>分类销售占比</b></template>
          <div ref="catRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="chart-card">
      <template #header><b>热销商品 Top 8</b></template>
      <div ref="topRef" class="chart"></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  getStatisticsOverview, getSalesTrend, getOrderStatusStat, getCategorySales, getTopProducts
} from '../../api/admin'

const loading = ref(false)
const overview = ref<any>({})
const days = ref(30)

const trendRef = ref<HTMLElement>()
const statusRef = ref<HTMLElement>()
const catRef = ref<HTMLElement>()
const topRef = ref<HTMLElement>()

const charts: echarts.ECharts[] = []
const COLORS = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399', '#9254de']

const money = (v: any) => Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

function initChart(el?: HTMLElement) {
  if (!el) return null
  const exist = echarts.getInstanceByDom(el)
  if (exist) return exist
  const c = echarts.init(el)
  charts.push(c)
  return c
}

async function loadOverview() {
  const r: any = await getStatisticsOverview()
  overview.value = r.data
}

async function loadTrend() {
  const r: any = await getSalesTrend(days.value)
  const data = r.data as any[]
  const chart = initChart(trendRef.value)
  chart?.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['销售额', '订单数'], right: 10 },
    grid: { left: 60, right: 50, top: 40, bottom: 40 },
    xAxis: { type: 'category', data: data.map(d => d.date.slice(5)) },
    yAxis: [
      { type: 'value', name: '销售额' },
      { type: 'value', name: '订单数', splitLine: { show: false } }
    ],
    series: [
      { name: '销售额', type: 'line', smooth: true, data: data.map(d => Number(d.amount || 0)),
        areaStyle: { opacity: 0.12 }, itemStyle: { color: '#409eff' } },
      { name: '订单数', type: 'bar', yAxisIndex: 1, data: data.map(d => Number(d.orders || 0)),
        barWidth: 8, itemStyle: { color: '#c6e2ff' } }
    ]
  }, true)
}

async function loadStatus() {
  const r: any = await getOrderStatusStat()
  const chart = initChart(statusRef.value)
  chart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    color: COLORS,
    series: [{
      type: 'pie', radius: ['42%', '68%'], center: ['50%', '45%'],
      label: { formatter: '{b}\n{c} 单' },
      data: (r.data as any[]).map(d => ({ name: d.name, value: d.count }))
    }]
  }, true)
}

async function loadCategory() {
  const r: any = await getCategorySales()
  const chart = initChart(catRef.value)
  const data = (r.data as any[]) || []
  chart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    color: COLORS,
    series: [{
      type: 'pie', radius: '62%', center: ['50%', '44%'],
      label: { formatter: '{b}\n￥{c}' },
      data: data.map(d => ({ name: d.name, value: Number(d.amount || 0) }))
    }]
  }, true)
}

async function loadTop() {
  const r: any = await getTopProducts(8)
  const data = (r.data as any[]) || []
  const chart = initChart(topRef.value)
  chart?.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 130, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: data.map(d => d.productName).reverse() },
    series: [{
      type: 'bar', data: data.map(d => Number(d.quantity || 0)).reverse(),
      itemStyle: { color: '#409eff', borderRadius: [0, 4, 4, 0] }, barWidth: 16
    }]
  }, true)
}

function resize() { charts.forEach(c => c.resize()) }

onMounted(async () => {
  loading.value = true
  try {
    await loadOverview()
    await nextTick()
    await Promise.all([loadTrend(), loadStatus(), loadCategory(), loadTop()])
  } finally { loading.value = false }
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  charts.forEach(c => c.dispose())
})
</script>

<style scoped>
.cards { margin-bottom: 16px; }
.kpi { display: flex; flex-direction: column; gap: 6px; }
.kpi span { color: #909399; font-size: 13px; }
.kpi b { font-size: 26px; color: #303133; }
.kpi b.red { color: #f56c6c; }
.kpi b.orange { color: #e6a23c; }
.kpi em { font-size: 12px; color: #c0c4cc; font-style: normal; }
.kpi.sm b { font-size: 20px; }
.chart-card { margin-bottom: 16px; }
.chart { width: 100%; height: 300px; }
.chart.tall { height: 340px; }
.card-head { display: flex; justify-content: space-between; align-items: center; }
</style>
