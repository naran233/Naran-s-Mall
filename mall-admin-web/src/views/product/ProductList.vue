<template>
  <div>
    <el-card>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索商品名称" clearable style="width:240px" @keyup.enter="load" />
        <el-button type="primary" @click="load">查询</el-button>
        <el-button type="success" @click="openCreate">新增商品</el-button>
      </div>
      <el-table :data="rows" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="name" label="商品名称" min-width="180" />
        <el-table-column label="图片" width="90">
          <template #default="{ row }">
            <el-image :src="row.pic" style="width:56px;height:56px" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="90" />
        <el-table-column prop="sale" label="销量" width="90" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.publishStatus === 1 ? 'success' : 'info'">
              {{ row.publishStatus === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="togglePublish(row)">
              {{ row.publishStatus === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                     :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
    </el-card>

    <el-dialog v-model="dialog" :title="form.id ? '编辑商品' : '新增商品'" width="620px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="商品名称"><el-input v-model="form.name" /></el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width:100%" /></el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="品牌">
              <el-select v-model="form.brandId" placeholder="选择品牌" style="width:100%">
                <el-option v-for="b in brands" :key="b.id" :label="b.name" :value="b.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类">
              <el-tree-select v-model="form.productCategoryId" :data="categories" :props="{ label: 'name', value: 'id' }"
                              check-strictly placeholder="选择分类" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="图片地址"><el-input v-model="form.pic" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item>
        <el-row>
          <el-col :span="8"><el-form-item label="新品"><el-switch v-model="form.newStatus" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="推荐"><el-switch v-model="form.recommandStatus" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="上架"><el-switch v-model="form.publishStatus" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProducts, createProduct, updateProduct, deleteProduct, publishProduct, getBrands, getCategoryTree } from '../../api/admin'

const rows = ref<any[]>([])
const brands = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialog = ref(false)
const form = reactive<any>({})

function resetForm() {
  Object.assign(form, {
    id: null, name: '', price: 0, stock: 0, brandId: null, productCategoryId: null,
    pic: '', description: '', newStatus: 0, recommandStatus: 0, publishStatus: 1
  })
}

async function load() {
  loading.value = true
  try {
    const r: any = await getProducts({ keyword: keyword.value, pageNum: pageNum.value, pageSize: pageSize.value })
    rows.value = r.data.list
    total.value = r.data.total
  } finally {
    loading.value = false
  }
}

function onPage(p: number) { pageNum.value = p; load() }
function openCreate() { resetForm(); dialog.value = true }
function openEdit(row: any) { resetForm(); Object.assign(form, row); dialog.value = true }

async function save() {
  if (!form.name) { ElMessage.warning('请输入商品名称'); return }
  saving.value = true
  try {
    if (form.id) {
      await updateProduct(form.id, { ...form })
    } else {
      await createProduct({ product: { ...form }, skus: [] })
    }
    ElMessage.success('保存成功')
    dialog.value = false
    load()
  } finally { saving.value = false }
}

async function togglePublish(row: any) {
  await publishProduct(row.id, row.publishStatus === 1 ? 0 : 1)
  ElMessage.success('操作成功')
  load()
}

async function remove(row: any) {
  await ElMessageBox.confirm(`确认删除商品「${row.name}」？`, '提示', { type: 'warning' })
  await deleteProduct(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  resetForm()
  const [b, c]: any = await Promise.all([getBrands(), getCategoryTree()])
  brands.value = b.data
  categories.value = c.data
  load()
})
</script>

<style scoped>
.toolbar { display: flex; gap: 10px; margin-bottom: 16px; }
.pager { margin-top: 16px; display: flex; justify-content: flex-end; }
</style>
