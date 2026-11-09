<template>
  <div class="service">
    <el-row :gutter="16">
      <el-col :span="14">
        <el-card>
          <template #header><b>提交服务工单</b></template>
          <el-form :model="form" label-width="90px">
            <el-form-item label="问题类型">
              <el-radio-group v-model="form.type">
                <el-radio-button :label="1">咨询</el-radio-button>
                <el-radio-button :label="2">投诉</el-radio-button>
                <el-radio-button :label="3">退换货</el-radio-button>
                <el-radio-button :label="4">售后</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="关联订单">
              <el-select v-model="form.orderId" placeholder="可不选" clearable style="width:100%">
                <el-option v-for="o in orders" :key="o.id" :label="`${o.orderSn}（￥${o.payAmount}）`" :value="String(o.id)" />
              </el-select>
            </el-form-item>
            <el-form-item label="问题标题">
              <el-input v-model="form.title" placeholder="一句话描述问题" maxlength="80" show-word-limit />
            </el-form-item>
            <el-form-item label="问题描述">
              <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请详细描述遇到的问题" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" :loading="submitting" @click="submit">提交工单</el-button>
              <el-button @click="reset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="10">
        <el-card>
          <template #header><b>联系客服</b></template>
          <div class="contact">
            <div class="row"><span>客服电话</span><b>{{ settings.service_phone || '400-800-8888' }}</b></div>
            <div class="row"><span>客服邮箱</span><b>{{ settings.service_email || 'service@mall.com' }}</b></div>
            <div class="row"><span>服务时间</span><b>每日 09:00 - 21:00</b></div>
          </div>
          <el-divider />
          <div class="tips">
            <p>· 提交工单后客服会在 1 个工作日内回复，可在「我的工单」查看进度。</p>
            <p>· 退换货请先保留商品包装与凭证。</p>
            <p>· 常见问题可先查看
              <el-link type="primary" @click="$router.push('/help')">帮助中心</el-link>。
            </p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="mine" v-loading="loading">
      <template #header><b>我的工单</b></template>
      <el-empty v-if="!tickets.length" description="暂无工单记录" />
      <div v-for="t in tickets" :key="t.id" class="ticket">
        <div class="t-head">
          <span class="sn">{{ t.ticketSn }} · {{ typeText(t.type) }}</span>
          <el-tag :type="statusTag(t.status)">{{ statusText(t.status) }}</el-tag>
        </div>
        <div class="t-title">{{ t.title }}</div>
        <div class="t-content">{{ t.content }}</div>
        <div v-if="t.replyContent" class="t-reply">
          <b>客服回复：</b>{{ t.replyContent }}
          <span class="t-time">{{ t.replyTime }}</span>
        </div>
        <div class="t-foot">{{ t.createTime }}</div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createTicket, myTickets, myOrders, getSiteSettings } from '../api/portal'

const form = reactive<any>({ type: 1, orderId: '', title: '', content: '' })
const submitting = ref(false)
const loading = ref(false)
const tickets = ref<any[]>([])
const orders = ref<any[]>([])
const settings = ref<any>({})

const typeMap: any = { 1: '咨询', 2: '投诉', 3: '退换货', 4: '售后' }
const statusMap: any = { 0: '待处理', 1: '处理中', 2: '已回复', 3: '已关闭' }
const typeText = (t: number) => typeMap[t] || '其他'
const statusText = (s: number) => statusMap[s] || '未知'
function statusTag(s: number) {
  if (s === 0) return 'warning'
  if (s === 1) return 'primary'
  if (s === 2) return 'success'
  return 'info'
}

async function loadTickets() {
  loading.value = true
  try {
    const r: any = await myTickets()
    tickets.value = r.data
  } finally { loading.value = false }
}

async function loadOrders() {
  try {
    const r: any = await myOrders()
    orders.value = r.data
  } catch { /* 未登录时忽略 */ }
}

async function loadSettings() {
  try {
    const r: any = await getSiteSettings()
    settings.value = r.data
  } catch { /* ignore */ }
}

function reset() {
  form.type = 1
  form.orderId = ''
  form.title = ''
  form.content = ''
}

async function submit() {
  if (!form.title.trim()) { ElMessage.warning('请填写问题标题'); return }
  if (!form.content.trim()) { ElMessage.warning('请填写问题描述'); return }
  submitting.value = true
  try {
    await createTicket({ ...form })
    ElMessage.success('工单已提交，客服会尽快处理')
    reset()
    loadTickets()
  } finally { submitting.value = false }
}

onMounted(() => {
  loadTickets()
  loadOrders()
  loadSettings()
})
</script>

<style scoped>
.service { max-width: 1200px; margin: 0 auto; }
.contact .row { display: flex; justify-content: space-between; padding: 10px 0; color: #606266; font-size: 14px; }
.contact .row b { color: #303133; }
.tips p { color: #909399; font-size: 13px; line-height: 1.9; margin: 0 0 6px; }
.mine { margin-top: 16px; }
.ticket { border: 1px solid #ebeef5; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
.t-head { display: flex; justify-content: space-between; align-items: center; }
.sn { color: #909399; font-size: 13px; }
.t-title { margin: 10px 0 6px; font-weight: 600; color: #303133; }
.t-content { color: #606266; font-size: 14px; line-height: 1.8; }
.t-reply { margin-top: 10px; padding: 10px 12px; background: #f0f9eb; border-radius: 6px; color: #529b2e; font-size: 14px; line-height: 1.8; }
.t-time { color: #c0c4cc; font-size: 12px; margin-left: 8px; }
.t-foot { margin-top: 10px; color: #c0c4cc; font-size: 12px; }
</style>
