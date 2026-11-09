<template>
  <div v-loading="loading">
    <el-card>
      <template #header><b>我的购物车</b></template>
      <el-table :data="items" @selection-change="onSelect">
        <el-table-column type="selection" width="50" />
        <el-table-column label="商品" min-width="280">
          <template #default="{ row }">
            <div class="item">
              <img :src="row.productPic" class="thumb" />
              <div>
                <div class="name">{{ row.productName }}</div>
                <div class="sub">规格ID：{{ row.productSkuId || '-' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="单价" width="120">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column label="数量" width="160">
          <template #default="{ row }">
            <el-input-number :model-value="row.quantity" :min="1" size="small" @change="(v) => changeQty(row, v)" />
          </template>
        </el-table-column>
        <el-table-column label="小计" width="130">
          <template #default="{ row }">￥{{ (row.price * row.quantity).toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="{ row }"><el-button link type="danger" @click="remove(row)">删除</el-button></template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && !items.length" description="购物车还是空的" />

      <div class="bar">
        <div>已选 <b>{{ selected.length }}</b> 件，合计：<span class="price">￥{{ total }}</span></div>
        <el-button type="danger" size="large" :disabled="!selected.length" @click="checkout">去结算</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCart, updateCart, deleteCart } from '../api/portal'

const router = useRouter()
const items = ref<any[]>([])
const selected = ref<any[]>([])
const loading = ref(false)

const total = computed(() => selected.value.reduce((s, r) => s + r.price * r.quantity, 0).toFixed(2))

async function load() {
  loading.value = true
  try {
    const r: any = await getCart()
    items.value = r.data
  } finally { loading.value = false }
}
function onSelect(rows: any[]) { selected.value = rows }

async function changeQty(row: any, v: number) {
  await updateCart(row.id, v)
  row.quantity = v
}
async function remove(row: any) {
  await ElMessageBox.confirm('确认从购物车删除该商品？', '提示', { type: 'warning' })
  await deleteCart(row.id)
  ElMessage.success('已删除')
  load()
}
function checkout() {
  const ids = selected.value.map(r => r.id)
  localStorage.setItem('checkout_items', JSON.stringify(ids))
  router.push('/checkout')
}

onMounted(load)
</script>

<style scoped>
.item { display: flex; gap: 12px; align-items: center; }
.thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; }
.name { font-size: 14px; color: #303133; }
.sub { font-size: 12px; color: #909399; margin-top: 4px; }
.bar { display: flex; justify-content: flex-end; align-items: center; gap: 24px; margin-top: 20px; }
.price { color: #f56c6c; font-size: 22px; font-weight: 700; }
</style>
