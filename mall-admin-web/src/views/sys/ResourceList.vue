<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-button type="success" @click="openCreate">新增资源</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="资源名" min-width="180" />
        <el-table-column prop="url" label="资源URL" min-width="260" />
        <el-table-column prop="categoryId" label="分类ID" width="100" />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑资源' : '新增资源'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="资源名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="URL"><el-input v-model="form.url" /></el-form-item>
        <el-form-item label="分类ID"><el-input-number v-model="form.categoryId" :min="0" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getResources, createResource, updateResource, deleteResource } from '../../api/admin'

const rows = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const form = reactive<any>({ id: null, name: '', url: '', categoryId: 1 })

async function load() {
  loading.value = true
  try {
    const r: any = await getResources()
    rows.value = r.data
  } finally { loading.value = false }
}

function openCreate() { Object.assign(form, { id: null, name: '', url: '', categoryId: 1 }); dialog.value = true }
function openEdit(row: any) { Object.assign(form, row); dialog.value = true }

async function save() {
  if (!form.name) { ElMessage.warning('请输入资源名'); return }
  if (form.id) await updateResource(form.id, { ...form })
  else await createResource({ ...form })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除资源「${row.name}」？`, '提示', { type: 'warning' })
  await deleteResource(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
