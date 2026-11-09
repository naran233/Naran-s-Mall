<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-button type="success" @click="openCreate(0)">新增菜单</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="tree" v-loading="loading" row-key="id" :tree-props="{ children: 'children' }" border default-expand-all>
        <el-table-column prop="title" label="菜单名" min-width="180" />
        <el-table-column prop="name" label="路由名" min-width="150" />
        <el-table-column prop="icon" label="图标" width="120" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button link type="primary" @click="openCreate(row.id)">添加子项</el-button>
            <el-button link type="warning" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑菜单' : '新增菜单'" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="菜单名"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="路由名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="图标"><el-input v-model="form.icon" placeholder="Element Plus 图标名" /></el-form-item>
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
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '../../api/admin'

const tree = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const form = reactive<any>({ id: null, title: '', name: '', icon: '', parentId: 0, sort: 0, type: 1, hidden: 0 })

async function load() {
  loading.value = true
  try {
    const r: any = await getMenuTree()
    tree.value = r.data
  } finally { loading.value = false }
}

function openCreate(parentId: number) {
  Object.assign(form, { id: null, title: '', name: '', icon: '', parentId, sort: 0, type: 1, hidden: 0 })
  dialog.value = true
}
function openEdit(row: any) {
  Object.assign(form, { id: row.id, title: row.title, name: row.name, icon: row.icon, parentId: row.parentId, sort: row.sort, type: row.type, hidden: row.hidden })
  dialog.value = true
}

async function save() {
  if (!form.title) { ElMessage.warning('请输入菜单名'); return }
  if (form.id) await updateMenu(form.id, { ...form })
  else await createMenu({ ...form })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除菜单「${row.title}」？`, '提示', { type: 'warning' })
  await deleteMenu(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
