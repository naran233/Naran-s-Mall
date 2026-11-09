<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-button type="success" @click="openCreate(0)">新增一级分类</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="tree" v-loading="loading" row-key="id" :tree-props="{ children: 'children' }" border default-expand-all>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="分类名称" min-width="200" />
        <el-table-column prop="level" label="层级" width="90">
          <template #default="{ row }">{{ row.level === 0 ? '一级' : '二级' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="操作" width="280">
          <template #default="{ row }">
            <el-button link type="primary" @click="openCreate(row.id)">添加子类</el-button>
            <el-button link type="warning" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑分类' : '新增分类'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="上级ID"><el-input-number v-model="form.parentId" :min="0" style="width:100%" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" style="width:100%" /></el-form-item>
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
import { getCategoryTree, createCategory, updateCategory, deleteCategory } from '../../api/admin'

const tree = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const form = reactive<any>({ id: null, name: '', parentId: 0, sort: 0 })

async function load() {
  loading.value = true
  try {
    const r: any = await getCategoryTree()
    tree.value = r.data
  } finally { loading.value = false }
}

function openCreate(parentId: number) {
  Object.assign(form, { id: null, name: '', parentId, sort: 0 })
  dialog.value = true
}
function openEdit(row: any) {
  Object.assign(form, { id: row.id, name: row.name, parentId: row.parentId, sort: row.sort })
  dialog.value = true
}

async function save() {
  if (!form.name) { ElMessage.warning('请输入名称'); return }
  if (form.id) await updateCategory(form.id, { ...form })
  else await createCategory({ ...form, level: form.parentId === 0 ? 0 : 1 })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」及其子类？`, '提示', { type: 'warning' })
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
