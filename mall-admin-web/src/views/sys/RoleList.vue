<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-button type="success" @click="openCreate">新增角色</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名" min-width="160" />
        <el-table-column prop="description" label="描述" min-width="220" />
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="openMenu(row)">分配菜单</el-button>
            <el-button link type="warning" @click="openResource(row)">分配资源</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑角色' : '新增角色'" width="460px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="角色名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="menuDialog" title="分配菜单" width="480px">
      <el-tree ref="menuTreeRef" :data="menuTree" show-checkbox node-key="id" :props="{ label: 'title', children: 'children' }" default-expand-all />
      <template #footer>
        <el-button @click="menuDialog = false">取消</el-button>
        <el-button type="primary" @click="saveMenus">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="resourceDialog" title="分配资源" width="480px">
      <el-checkbox-group v-model="selectedResources">
        <el-checkbox v-for="r in resources" :key="r.id" :value="r.id" :label="r.id" style="display:block;margin:8px 0">
          {{ r.name }} ({{ r.url }})
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="resourceDialog = false">取消</el-button>
        <el-button type="primary" @click="saveResources">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoles, createRole, updateRole, deleteRole, assignMenus, assignResources, getMenuTree, getResources } from '../../api/admin'

const rows = ref<any[]>([])
const menuTree = ref<any[]>([])
const resources = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const menuDialog = ref(false)
const resourceDialog = ref(false)
const currentRoleId = ref<number | null>(null)
const selectedResources = ref<number[]>([])
const menuTreeRef = ref<any>(null)
const form = reactive<any>({ id: null, name: '', description: '' })

async function load() {
  loading.value = true
  try {
    const r: any = await getRoles()
    rows.value = r.data
  } finally { loading.value = false }
}

function openCreate() { Object.assign(form, { id: null, name: '', description: '' }); dialog.value = true }
function openEdit(row: any) { Object.assign(form, { id: row.id, name: row.name, description: row.description }); dialog.value = true }

async function save() {
  if (!form.name) { ElMessage.warning('请输入角色名'); return }
  if (form.id) await updateRole(form.id, { ...form })
  else await createRole({ ...form })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

async function openMenu(row: any) {
  currentRoleId.value = row.id
  menuDialog.value = true
}
async function saveMenus() {
  const checked = menuTreeRef.value?.getCheckedKeys() || []
  if (currentRoleId.value) await assignMenus(currentRoleId.value, checked)
  ElMessage.success('分配成功')
  menuDialog.value = false
}

function openResource(row: any) {
  currentRoleId.value = row.id
  selectedResources.value = []
  resourceDialog.value = true
}
async function saveResources() {
  if (currentRoleId.value) await assignResources(currentRoleId.value, selectedResources.value)
  ElMessage.success('分配成功')
  resourceDialog.value = false
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除角色「${row.name}」？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  const [m, res]: any = await Promise.all([getMenuTree(), getResources()])
  menuTree.value = m.data
  resources.value = res.data
  load()
})
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
