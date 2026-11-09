<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-button type="success" @click="openCreate">新增品牌</el-button>
        <el-button @click="load">刷新</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="品牌名称" min-width="160" />
        <el-table-column label="Logo" width="110">
          <template #default="{ row }"><el-image :src="row.logo" style="width:64px;height:40px" fit="contain" /></template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑品牌' : '新增品牌'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Logo地址"><el-input v-model="form.logo" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" /></el-form-item>
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
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../api/admin'

const rows = ref<any[]>([])
const loading = ref(false)
const dialog = ref(false)
const form = reactive<any>({ id: null, name: '', logo: '', description: '', sort: 0, showStatus: 1 })

async function load() {
  loading.value = true
  try {
    const r: any = await getBrands()
    rows.value = r.data
  } finally { loading.value = false }
}

function openCreate() { Object.assign(form, { id: null, name: '', logo: '', description: '', sort: 0, showStatus: 1 }); dialog.value = true }
function openEdit(row: any) { Object.assign(form, row); dialog.value = true }

async function save() {
  if (!form.name) { ElMessage.warning('请输入品牌名'); return }
  if (form.id) await updateBrand(form.id, { ...form })
  else await createBrand({ ...form })
  ElMessage.success('保存成功')
  dialog.value = false
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除品牌「${row.name}」？`, '提示', { type: 'warning' })
  await deleteBrand(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(load)
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
</style>
