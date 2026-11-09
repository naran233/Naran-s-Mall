<template>
  <div>
    <el-card>
      <div class="stats">
        <div class="stat"><span class="num warn">{{ stats.pending ?? 0 }}</span><span>待处理</span></div>
        <div class="stat"><span class="num">{{ stats.processing ?? 0 }}</span><span>处理中</span></div>
        <div class="stat"><span class="num ok">{{ stats.replied ?? 0 }}</span><span>已回复</span></div>
        <div class="stat"><span class="num muted">{{ stats.closed ?? 0 }}</span><span>已关闭</span></div>
        <div class="stat"><span class="num">{{ stats.total ?? 0 }}</span><span>总计</span></div>
      </div>

      <div class="toolbar">
        <el-input v-model="keyword" placeholder="工单号 / 标题 / 内容" clearable style="width:240px" @keyup.enter="load" />
        <el-select v-model="status" placeholder="状态" clearable style="width:130px" @change="load">
          <el-option label="待处理" :value="0" />
          <el-option label="处理中" :value="1" />
          <el-option label="已回复" :value="2" />
          <el-option label="已关闭" :value="3" />
        </el-select>
        <el-select v-model="type" placeholder="类型" clearable style="width:130px" @change="load">
          <el-option label="咨询" :value="1" />
          <el-option label="投诉" :value="2" />
          <el-option label="退换货" :value="3" />
          <el-option label="售后" :value="4" />
        </el-select>
        <el-button type="primary" @click="load">查询</el-button>
      </div>

      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column label="工单号" min-width="160">
          <template #default="{ row }">{{ row.ticket.ticketSn }}</template>
        </el-table-column>
        <el-table-column label="会员" min-width="110">
          <template #default="{ row }">{{ row.memberName }}</template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag effect="plain">{{ typeText(row.ticket.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="200">
          <template #default="{ row }">{{ row.ticket.title }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.ticket.status)">{{ statusText(row.ticket.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" min-width="160">
          <template #default="{ row }">{{ row.ticket.createTime }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row.ticket)">处理</el-button>
            <el-button v-if="row.ticket.status !== 3" link @click="closeTicket(row.ticket)">关闭</el-button>
            <el-button link type="danger" @click="remove(row.ticket)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-drawer v-model="drawer" title="工单处理" size="520px">
      <template v-if="current">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单号">{{ current.ticketSn }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ typeText(current.type) }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ current.title }}</el-descriptions-item>
          <el-descriptions-item label="内容">{{ current.content }}</el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ current.createTime }}</el-descriptions-item>
          <el-descriptions-item v-if="current.replyContent" label="已有回复">{{ current.replyContent }}</el-descriptions-item>
        </el-descriptions>
        <h4>客服回复</h4>
        <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容" />
        <div class="reply-actions">
          <el-button type="primary" :loading="saving" @click="doReply">提交回复</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTickets, getTicketStats, replyTicket, changeTicketStatus, deleteTicket } from '../../api/admin'

const rows = ref<any[]>([])
const stats = ref<any>({})
const loading = ref(false)
const keyword = ref('')
const status = ref<number | undefined>(undefined)
const type = ref<number | undefined>(undefined)
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const drawer = ref(false)
const current = ref<any>(null)
const replyContent = ref('')
const saving = ref(false)

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

async function load() {
  loading.value = true
  try {
    const r: any = await getTickets({
      keyword: keyword.value, status: status.value, type: type.value,
      pageNum: pageNum.value, pageSize: pageSize.value
    })
    rows.value = r.data.list
    total.value = r.data.total
    const s: any = await getTicketStats()
    stats.value = s.data
  } finally { loading.value = false }
}

function onPage(p: number) { pageNum.value = p; load() }

async function openDetail(t: any) {
  const r: any = await getTicket(t.id)
  current.value = r.data.ticket
  replyContent.value = t.replyContent || ''
  drawer.value = true
}

async function doReply() {
  if (!replyContent.value.trim()) { ElMessage.warning('请填写回复内容'); return }
  saving.value = true
  try {
    await replyTicket(current.value.id, { replyContent: replyContent.value, replyMan: '客服' })
    ElMessage.success('回复成功')
    drawer.value = false
    load()
  } finally { saving.value = false }
}

async function closeTicket(t: any) {
  await ElMessageBox.confirm(`确认关闭工单「${t.ticketSn}」？`, '提示', { type: 'warning' })
  await changeTicketStatus(t.id, 3)
  ElMessage.success('工单已关闭')
  load()
}

async function remove(t: any) {
  await ElMessageBox.confirm(`确认删除工单「${t.ticketSn}」？`, '提示', { type: 'warning' })
  await deleteTicket(t.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.stats { display: flex; gap: 12px; margin-bottom: 16px; }
.stat { flex: 1; background: #f5f7fa; border-radius: 8px; padding: 12px; text-align: center; color: #606266; font-size: 13px; }
.stat .num { display: block; font-size: 22px; font-weight: 700; color: #303133; }
.stat .num.warn { color: #e6a23c; }
.stat .num.ok { color: #67c23a; }
.stat .num.muted { color: #909399; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
h4 { margin: 18px 0 8px; }
.reply-actions { margin-top: 12px; text-align: right; }
</style>
