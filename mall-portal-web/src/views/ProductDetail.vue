<template>
  <div v-loading="loading">
    <el-card v-if="product.id">
      <el-row :gutter="24">
        <el-col :span="10">
          <img :src="product.pic" style="width:100%;height:360px;object-fit:cover;border-radius:8px" />
        </el-col>
        <el-col :span="14">
          <h2 class="title">{{ product.name }}</h2>
          <div class="price-box">
            <span class="price">￥{{ product.price }}</span>
            <span class="meta">销量 {{ product.sale }} ｜ 库存 {{ product.stock }}</span>
          </div>
          <div class="meta-line">品牌：{{ product.brandName }} ｜ 分类：{{ product.productCategoryName }}</div>

          <div class="sku-line" v-if="product.skus && product.skus.length">
            <span class="label">规格：</span>
            <el-radio-group v-model="skuId">
              <el-radio-button v-for="s in product.skus" :key="s.id" :label="s.id">
                {{ s.sp1 || s.skuCode }}{{ s.sp2 ? ' / ' + s.sp2 : '' }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="sku-line">
            <span class="label">数量：</span>
            <el-input-number v-model="quantity" :min="1" :max="99" />
          </div>

          <div class="actions">
            <el-button type="warning" size="large" :icon="ShoppingCart" @click="add(true)">加入购物车</el-button>
            <el-button type="danger" size="large" @click="add(false)">立即购买</el-button>
          </div>

          <div class="desc">
            <h4>商品介绍</h4>
            <p>{{ product.description }}</p>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ShoppingCart } from '@element-plus/icons-vue'
import { getProduct, addToCart } from '../api/portal'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const product = reactive<any>({})
const quantity = ref(1)
const skuId = ref<number | undefined>(undefined)

async function load() {
  loading.value = true
  try {
    const r: any = await getProduct(Number(route.params.id))
    Object.assign(product, r.data)
    if (product.skus && product.skus.length) skuId.value = product.skus[0].id
  } finally { loading.value = false }
}

async function add(stay: boolean) {
  if (!localStorage.getItem('member_token')) {
    ElMessage.warning('请先登录')
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  await addToCart({ productId: product.id, productSkuId: skuId.value, quantity: quantity.value })
  ElMessage.success('已加入购物车')
  if (!stay) router.push('/cart')
}

onMounted(load)
</script>

<style scoped>
.title { margin-top: 0; color: #303133; }
.price-box { background: #fef0f0; padding: 16px; border-radius: 8px; margin: 12px 0; }
.price { color: #f56c6c; font-size: 28px; font-weight: 700; }
.meta { color: #909399; font-size: 13px; margin-left: 16px; }
.meta-line { color: #606266; font-size: 14px; margin-bottom: 12px; }
.sku-line { display: flex; align-items: center; margin: 14px 0; }
.label { color: #606266; width: 60px; }
.actions { margin: 24px 0; display: flex; gap: 12px; }
.desc h4 { margin-bottom: 6px; }
.desc p { color: #606266; line-height: 1.8; }
</style>
