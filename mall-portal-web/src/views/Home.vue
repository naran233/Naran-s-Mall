<template>
  <div v-loading="loading">
    <el-row :gutter="16">
      <el-col :span="4">
        <div class="cate-panel">
          <div class="cate-title">商品分类</div>
          <el-menu :default-active="''" @select="goCategory">
            <el-sub-menu v-for="c in home.categoryTree || []" :key="c.id" :index="String(c.id)">
              <template #title>{{ c.name }}</template>
              <el-menu-item v-for="s in c.children || []" :key="s.id" :index="String(s.id)">{{ s.name }}</el-menu-item>
            </el-sub-menu>
            <el-menu-item v-if="!(home.categoryTree || []).length" index="none" disabled>暂无分类</el-menu-item>
          </el-menu>
        </div>
      </el-col>
      <el-col :span="20">
        <el-carousel
          height="320px"
          :interval="4000"
          arrow="hover"
          indicator-position="inside"
          :autoplay="banners.length > 1"
          :loop="banners.length !== 2"
          class="banner-carousel"
        >
          <el-carousel-item v-for="a in banners" :key="a.id">
            <div class="banner" :class="{ clickable: !!bannerTarget(a) }" @click="goBanner(a)">
              <img :src="a.pic" class="banner-img" :alt="a.name || ''" />
              <div v-if="a.product" class="banner-info">
                <span class="banner-tag">{{ a.name || '限时推荐' }}</span>
                <div class="banner-name">{{ a.product.name }}</div>
                <div class="banner-price">
                  <span class="cur">￥</span>{{ a.product.price }}
                  <span class="sale" v-if="a.product.sale !== null && a.product.sale !== undefined">已售 {{ a.product.sale }}</span>
                </div>
                <span class="banner-buy">立即抢购 →</span>
              </div>
            </div>
          </el-carousel-item>
          <el-carousel-item v-if="!banners.length">
            <div class="banner-empty">暂无轮播图</div>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>

    <section v-for="block in blocks" :key="block.title" class="block">
      <div class="block-title">{{ block.title }}</div>
      <el-row :gutter="16">
        <el-col :span="6" v-for="p in block.list || []" :key="p.id">
          <div class="product-card" @click="$router.push('/product/' + p.id)">
            <img :src="p.pic" class="pic" />
            <div class="name">{{ p.name }}</div>
            <div class="bottom">
              <span class="price">￥{{ p.price }}</span>
              <span class="sale">已售 {{ p.sale }}</span>
            </div>
          </div>
        </el-col>
        <el-col v-if="!(block.list || []).length" :span="24">
          <el-empty description="暂无商品" :image-size="80" />
        </el-col>
      </el-row>
    </section>

    <section class="block">
      <div class="block-title">品牌制造商直供</div>
      <el-row :gutter="16">
        <el-col :span="4" v-for="b in home.brandList || []" :key="b.id">
          <div class="brand-card" @click="$router.push({ path: '/products', query: { brandId: b.id } })">
            <img :src="b.logo" class="brand-logo" />
            <div>{{ b.name }}</div>
          </div>
        </el-col>
      </el-row>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getHome } from '../api/portal'

const router = useRouter()
const loading = ref(false)
const home = reactive<any>({ advertiseList: [], brandList: [], hotProducts: [], newProducts: [], recommendProducts: [], categoryTree: [] })

const blocks = computed(() => [
  { title: '人气推荐', list: home.hotProducts },
  { title: '新鲜好物', list: home.newProducts },
  { title: '猜你喜欢', list: home.recommendProducts }
])

/** 首页轮播位：来自 /api/portal/home 的 advertiseList，已由后端补上关联商品 product */
const banners = computed<any[]>(() => home.advertiseList || [])
// 注意：Element Plus 在「恰好 2 张 + loop」时会把子项渲染两遍用于无缝轮播，
// 指示点会变成 4 个。这里对 2 张的情况关闭 loop 规避（此时自动播放播到最后一张即停）。

/** 轮播位可跳转目标：优先关联商品，其次广告 url */
function bannerTarget(a: any): string {
  const pid = a.productId || a.product?.id
  if (pid) return '/product/' + pid
  return (a.url || '').trim()
}

function goBanner(a: any) {
  const target = bannerTarget(a)
  if (!target) return
  if (/^https?:\/\//i.test(target)) {
    window.open(target, '_blank', 'noopener')
    return
  }
  router.push(target)
}

function goCategory(id: string) {
  router.push({ path: '/products', query: { categoryId: id } })
}

onMounted(async () => {
  loading.value = true
  try {
    const r: any = await getHome()
    Object.assign(home, r.data)
  } finally { loading.value = false }
})
</script>

<style scoped>
.cate-panel { background: #fff; border-radius: 8px; padding: 8px; height: 320px; overflow: auto; }
.cate-title { font-weight: 600; padding: 10px; color: #303133; }
.cate-panel :deep(.el-menu) { border-right: none; }

/* ===== 首页轮播 ===== */
.banner-carousel { border-radius: 8px; overflow: hidden; }
.banner { position: relative; width: 100%; height: 320px; }
.banner.clickable { cursor: pointer; }
.banner-img { width: 100%; height: 320px; display: block; object-fit: cover; }
/* 左侧压暗，保证商品名/价格在任何底图上都能读清 */
.banner::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,0) 70%); pointer-events: none; }
.banner-info { position: absolute; z-index: 1; left: 84px; top: 50%; transform: translateY(-50%); color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,.45); max-width: 60%; }
.banner-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; background: rgba(255,255,255,.24); margin-bottom: 12px; }
.banner-name { font-size: 26px; font-weight: 700; line-height: 1.3; margin-bottom: 12px; }
.banner-price { font-size: 22px; font-weight: 700; color: #ffe0e0; margin-bottom: 16px; }
.banner-price .cur { font-size: 14px; margin-right: 2px; }
.banner-price .sale { margin-left: 12px; font-size: 12px; font-weight: 400; color: rgba(255,255,255,.85); }
.banner-buy { display: inline-block; padding: 7px 18px; border-radius: 999px; background: #fff; color: #f56c6c; font-size: 13px; font-weight: 600; transition: all .2s; }
.banner:hover .banner-buy { background: #f56c6c; color: #fff; }
.banner-empty { display: flex; align-items: center; justify-content: center; height: 320px; color: #909399; background: #f5f7fa; }
/* 指示点默认几乎不可见，改为清晰可点的胶囊条 */
.banner-carousel :deep(.el-carousel__indicators--horizontal) { bottom: 14px; padding: 6px 10px; border-radius: 999px; background: rgba(0,0,0,.22); }
.banner-carousel :deep(.el-carousel__indicator) { padding: 4px 2px; }
.banner-carousel :deep(.el-carousel__indicator .el-carousel__button) { width: 24px; height: 4px; border-radius: 2px; background: rgba(255,255,255,.55); opacity: 1; }
.banner-carousel :deep(.el-carousel__indicator.is-active .el-carousel__button) { width: 32px; background: #fff; }
.block { margin-top: 28px; }
.block-title { font-size: 18px; font-weight: 700; margin-bottom: 14px; color: #303133; border-left: 4px solid #409eff; padding-left: 10px; }
.product-card { background: #fff; border-radius: 8px; padding: 10px; cursor: pointer; transition: .2s; margin-bottom: 16px; }
.product-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,.1); transform: translateY(-2px); }
.pic { width: 100%; height: 180px; object-fit: cover; border-radius: 6px; background: #f5f7fa; }
.name { margin: 10px 0 6px; font-size: 14px; color: #303133; height: 40px; overflow: hidden; }
.bottom { display: flex; justify-content: space-between; align-items: center; }
.price { color: #f56c6c; font-weight: 700; font-size: 16px; }
.sale { color: #909399; font-size: 12px; }
.brand-card { background: #fff; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; margin-bottom: 16px; }
.brand-logo { width: 90px; height: 50px; object-fit: contain; }
</style>
