<template>
  <div class="help-page">
    <el-card class="left">
      <template #header>
        <div class="card-head">
          <b>帮助分类</b>
          <el-button type="primary" size="small" @click="openCategory()">新增</el-button>
        </div>
      </template>
      <ul class="cat-list">
        <li :class="{ active: categoryId === undefined }" @click="selectCategory(undefined)">全部文章</li>
        <li v-for="c in categories" :key="c.id" :class="{ active: categoryId === c.id }"
            @click="selectCategory(c.id)">
          <span>{{ c.name }}</span>
          <span class="ops">
            <el-button link size="small" @click.stop="openCategory(c)">改</el-button>
            <el-button link type="danger" size="small" @click.stop="removeCategory(c)">删</el-button>
          </span>
        </li>
      </ul>
    </el-card>

    <el-card class="right">
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="标题 / 内容关键词" clearable style="width:240px" @keyup.enter="load" />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openArticle()">新增文章</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">{{ categoryName(row.categoryId) }}</template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="readCount" label="阅读量" width="90" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.showStatus === 1 ? 'success' : 'info'">{{ row.showStatus === 1 ? '显示' : '隐藏' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openArticle(row)">编辑</el-button>
            <el-button link type="danger" @click="removeArticle(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-dialog v-model="catDialog" :title="catForm.id ? '编辑分类' : '新增分类'" width="420px">
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="名称"><el-input v-model="catForm.name" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="catForm.sort" :min="0" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="catForm.showStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialog = false">取消</el-button>
        <el-button type="primary" @click="saveCategory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="artDialog" :title="artForm.id ? '编辑文章' : '新增文章'" width="640px">
      <el-form :model="artForm" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="artForm.categoryId" style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="标题"><el-input v-model="artForm.title" /></el-form-item>
        <el-form-item label="内容">
          <el-input v-model="artForm.content" type="textarea" :rows="8" />
        </el-form-item>
        <el-form-item label="排序"><el-input-number v-model="artForm.sort" :min="0" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="artForm.showStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="artDialog = false">取消</el-button>
        <el-button type="primary" @click="saveArticle">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getHelpCategories, createHelpCategory, updateHelpCategory, deleteHelpCategory,
  getHelps, createHelp, updateHelp, deleteHelp
} from '../../api/admin'

const categories = ref<any[]>([])
const categoryId = ref<number | undefined>(undefined)
const rows = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const catDialog = ref(false)
const catForm = reactive<any>({ id: null, name: '', sort: 0, showStatus: 1 })
const artDialog = ref(false)
const artForm = reactive<any>({ id: null, categoryId: null, title: '', content: '', sort: 0, showStatus: 1 })

const categoryName = (id: number) => categories.value.find(c => c.id === id)?.name || '—'

async function loadCategories() {
  const r: any = await getHelpCategories()
  categories.value = r.data
}

async function load() {
  loading.value = true
  try {
    const r: any = await getHelps({
      categoryId: categoryId.value, keyword: keyword.value,
      pageNum: pageNum.value, pageSize: pageSize.value
    })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}

function selectCategory(id?: number) {
  categoryId.value = id
  pageNum.value = 1
  load()
}
function onPage(p: number) { pageNum.value = p; load() }

function openCategory(row?: any) {
  Object.assign(catForm, row
    ? { id: row.id, name: row.name, sort: row.sort, showStatus: row.showStatus }
    : { id: null, name: '', sort: 0, showStatus: 1 })
  catDialog.value = true
}

async function saveCategory() {
  if (!catForm.name) { ElMessage.warning('请填写分类名称'); return }
  if (catForm.id) await updateHelpCategory(catForm.id, catForm)
  else await createHelpCategory(catForm)
  ElMessage.success('保存成功')
  catDialog.value = false
  await loadCategories()
  load()
}

async function removeCategory(row: any) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」？`, '提示', { type: 'warning' })
  await deleteHelpCategory(row.id)
  ElMessage.success('删除成功')
  await loadCategories()
  load()
}

function openArticle(row?: any) {
  Object.assign(artForm, row
    ? { id: row.id, categoryId: row.categoryId, title: row.title, content: row.content, sort: row.sort, showStatus: row.showStatus }
    : { id: null, categoryId: categoryId.value ?? (categories.value[0]?.id ?? null), title: '', content: '', sort: 0, showStatus: 1 })
  artDialog.value = true
}

async function saveArticle() {
  if (!artForm.title) { ElMessage.warning('请填写标题'); return }
  if (artForm.id) await updateHelp(artForm.id, artForm)
  else await createHelp(artForm)
  ElMessage.success('保存成功')
  artDialog.value = false
  load()
}

async function removeArticle(row: any) {
  await ElMessageBox.confirm(`确认删除文章「${row.title}」？`, '提示', { type: 'warning' })
  await deleteHelp(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  await loadCategories()
  load()
})
</script>

<style scoped>
.help-page { display: flex; gap: 16px; align-items: flex-start; }
.left { width: 240px; flex-shrink: 0; }
.right { flex: 1; }
.card-head { display: flex; justify-content: space-between; align-items: center; }
.cat-list { list-style: none; padding: 0; margin: 0; }
.cat-list li { display: flex; justify-content: space-between; align-items: center;
  padding: 9px 10px; border-radius: 6px; cursor: pointer; color: #606266; font-size: 14px; }
.cat-list li:hover { background: #f5f7fa; }
.cat-list li.active { background: #ecf5ff; color: #409eff; font-weight: 600; }
.cat-list .ops { opacity: 0; }
.cat-list li:hover .ops { opacity: 1; }
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
