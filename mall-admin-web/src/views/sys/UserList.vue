<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="用户名/昵称" clearable style="width:220px" @keyup.enter="load" />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openCreate">新增用户</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="140" />
        <el-table-column prop="nickName" label="昵称" min-width="140" />
        <el-table-column label="角色" min-width="160">
          <template #default="{ row }">
            <el-tag v-for="r in row.roleNames" :key="r" style="margin-right:6px">{{ r }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="170" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="openRoles(row)">分配角色</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑用户' : '新增用户'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" placeholder="留空则不修改" show-password /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickName" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="roleDialog" title="分配角色" width="420px">
      <el-checkbox-group v-model="selectedRoles">
        <el-checkbox v-for="r in roles" :key="r.id" :value="r.id" :label="r.id" style="display:block;margin:8px 0">
          {{ r.name }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="roleDialog = false">取消</el-button>
        <el-button type="primary" @click="saveRoles">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser, assignRoles, getRoles } from '../../api/admin'

const rows = ref<any[]>([])
const roles = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialog = ref(false)
const roleDialog = ref(false)
const selectedRoles = ref<number[]>([])
const currentUserId = ref<number | null>(null)
const form = reactive<any>({ id: null, username: '', password: '', nickName: '', status: 1 })

async function load() {
  loading.value = true
  try {
    const r: any = await getUsers({ keyword: keyword.value, pageNum: pageNum.value, pageSize: pageSize.value })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}
function onPage(p: number) { pageNum.value = p; load() }
function openCreate() { Object.assign(form, { id: null, username: '', password: '', nickName: '', status: 1 }); dialog.value = true }
function openEdit(row: any) { Object.assign(form, { id: row.id, username: row.username, password: '', nickName: row.nickName, status: row.status }); dialog.value = true }

async function save() {
  if (!form.username) { ElMessage.warning('请输入用户名'); return }
  if (form.id) await updateUser(form.id, { nickName: form.nickName, status: form.status, password: form.password })
  else {
    if (!form.password) { ElMessage.warning('请输入密码'); return }
    await createUser({ username: form.username, password: form.password, nickName: form.nickName, status: form.status })
  }
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

function openRoles(row: any) {
  currentUserId.value = row.id
  selectedRoles.value = [...(row.roleIds || [])]
  roleDialog.value = true
}
async function saveRoles() {
  if (currentUserId.value) await assignRoles(currentUserId.value, selectedRoles.value)
  ElMessage.success('分配成功')
  roleDialog.value = false
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除用户「${row.username}」？`, '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  const r: any = await getRoles()
  roles.value = r.data
  load()
})
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
