<template>
  <div>
    <div class="filter-bar">
      <span class="label">排序：</span>
      <el-radio-group v-model="sort" @change="reload">
        <el-radio-button label="sale">销量</el-radio-button>
        <el-radio-button label="new">最新</el-radio-button>
        <el-radio-button label="priceAsc">价格↑</el-radio-button>
        <el-radio-button label="priceDesc">价格↓</el-radio-button>
      </el-radio-group>
      <span class="keyword" v-if="keyword">搜索：{{ keyword }}</span>
    </div>

    <el-row :gutter="16" v-loading="loading">
      <el-col :span="6" v-for="p in rows" :key="p.id">
        <div class="product-card" @click="$router.push('/product/' + p.id)">
          <img :src="p.pic" class="pic" />
          <div class="name">{{ p.name }}</div>
          <div class="bottom">
            <span class="price">￥{{ p.price }}</span>
            <span class="sale">已售 {{ p.sale }}</span>
          </div>
        </div>
      </el-col>
      <el-col :span="24" v-if="!loading && !rows.length">
        <el-empty description="没有找到商品" />
      </el-col>
    </el-row>

    <el-pagination class="pager" background layout="total, prev, pager, next" :total="total"
                   :page-size="pageSize" :current-page="pageNum" @current-change="onPage" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchProducts } from '../api/portal'

const route = useRoute()
const rows = ref<any[]>([])
const loading = ref(false)
const keyword = ref('')
const sort = ref('sale')
const pageNum = ref(1)
const pageSize = ref(12)
const total = ref(0)
const categoryId = ref<number | undefined>()
const brandId = ref<number | undefined>()

async function load() {
  loading.value = true
  try {
    const r: any = await searchProducts({
      keyword: keyword.value, categoryId: categoryId.value, brandId: brandId.value,
      pageNum: pageNum.value, pageSize: pageSize.value, sort: sort.value
    })
    rows.value = r.data.list
    total.value = r.data.total
  } finally { loading.value = false }
}
function reload() { pageNum.value = 1; load() }
function onPage(p: number) { pageNum.value = p; load() }

function syncFromQuery() {
  keyword.value = (route.query.keyword as string) || ''
  categoryId.value = route.query.categoryId ? Number(route.query.categoryId) : undefined
  brandId.value = route.query.brandId ? Number(route.query.brandId) : undefined
  reload()
}

watch(() => route.query, syncFromQuery, { immediate: true })
</script>

<style scoped>
.filter-bar { background: #fff; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.label { color: #606266; font-size: 14px; }
.keyword { color: #909399; font-size: 14px; }
.product-card { background: #fff; border-radius: 8px; padding: 10px; cursor: pointer; transition: .2s; margin-bottom: 16px; }
.product-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.1); transform: translateY(-2px); }
.pic { width: 100%; height: 200px; object-fit: cover; border-radius: 6px; background: #f5f7fa; }
.name { margin: 10px 0 6px; font-size: 14px; height: 40px; overflow: hidden; }
.bottom { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-weight: 700; font-size: 16px; }
.sale { color: #909399; font-size: 12px; }
.pager { margin-top: 16px; display: flex; justify-content: center; }
</style>
