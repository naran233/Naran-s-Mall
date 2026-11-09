<template>
  <div class="help" v-loading="loading">
    <el-card class="banner">
      <div class="banner-inner">
        <h2>帮助中心</h2>
        <p>购物、支付、配送与售后问题，这里都有答案</p>
        <el-input v-model="keyword" placeholder="搜索问题，如「支付」「退换货」" size="large"
                  class="search" clearable @keyup.enter="loadArticles" @clear="loadArticles">
          <template #append><el-button @click="loadArticles">搜索</el-button></template>
        </el-input>
      </div>
    </el-card>

    <div class="body">
      <el-card class="side">
        <template #header><b>问题分类</b></template>
        <ul class="cat-list">
          <li :class="{ active: categoryId === undefined }" @click="selectCategory(undefined)">
            全部问题
          </li>
          <li v-for="c in categories" :key="c.id" :class="{ active: categoryId === c.id }"
              @click="selectCategory(c.id)">
            {{ c.name }}
          </li>
        </ul>
      </el-card>

      <el-card class="main">
        <template #header>
          <b>{{ currentCategoryName }}</b>
          <span class="count">共 {{ articles.length }} 篇</span>
        </template>
        <el-empty v-if="!articles.length" description="暂无相关文章" />
        <div v-for="a in articles" :key="a.id" class="article" @click="openArticle(a.id)">
          <div class="title">{{ a.title }}</div>
          <div class="meta">阅读 {{ a.readCount }} · {{ a.createTime }}</div>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="dialog" :title="current?.title" width="680px">
      <div v-if="current" class="content">
        <p class="meta">阅读 {{ current.readCount }} · {{ current.createTime }}</p>
        <div class="text">{{ current.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { getHelpCategories, getHelps, getHelpDetail } from '../api/portal'

const categories = ref<any[]>([])
const articles = ref<any[]>([])
const categoryId = ref<number | undefined>(undefined)
const keyword = ref('')
const loading = ref(false)
const dialog = ref(false)
const current = ref<any>(null)

const currentCategoryName = computed(() => {
  if (categoryId.value === undefined) return '全部问题'
  return categories.value.find(c => c.id === categoryId.value)?.name || '全部问题'
})

async function loadCategories() {
  const r: any = await getHelpCategories()
  categories.value = r.data
}

async function loadArticles() {
  loading.value = true
  try {
    const r: any = await getHelps({ categoryId: categoryId.value, keyword: keyword.value })
    articles.value = r.data.articles || []
  } finally { loading.value = false }
}

function selectCategory(id?: number) {
  categoryId.value = id
  loadArticles()
}

async function openArticle(id: number) {
  const r: any = await getHelpDetail(id)
  current.value = r.data
  dialog.value = true
  // 本地同步阅读量
  const hit = articles.value.find(a => a.id === id)
  if (hit) hit.readCount = r.data.readCount
}

onMounted(async () => {
  await loadCategories()
  await loadArticles()
})
</script>

<style scoped>
.help { max-width: 1200px; margin: 0 auto; }
.banner { margin-bottom: 16px; background: linear-gradient(120deg, #409eff 0%, #79bbff 100%); border: none; }
.banner-inner { text-align: center; padding: 18px 0; color: #fff; }
.banner-inner h2 { margin: 0 0 6px; font-size: 26px; }
.banner-inner p { margin: 0 0 16px; opacity: .92; font-size: 14px; }
.search { max-width: 520px; margin: 0 auto; }
.body { display: flex; gap: 16px; align-items: flex-start; }
.side { width: 220px; flex-shrink: 0; }
.cat-list { list-style: none; padding: 0; margin: 0; }
.cat-list li { padding: 10px 12px; border-radius: 6px; cursor: pointer; color: #606266; font-size: 14px; }
.cat-list li:hover { background: #f5f7fa; }
.cat-list li.active { background: #ecf5ff; color: #409eff; font-weight: 600; }
.main { flex: 1; min-height: 360px; }
.main :deep(.el-card__header) { display: flex; justify-content: space-between; align-items: center; }
.count { color: #909399; font-size: 13px; }
.article { padding: 14px 6px; border-bottom: 1px solid #f0f2f5; cursor: pointer; }
.article:last-child { border-bottom: none; }
.article:hover .title { color: #409eff; }
.article .title { font-size: 15px; color: #303133; }
.article .meta { margin-top: 6px; color: #c0c4cc; font-size: 12px; }
.content .meta { color: #c0c4cc; font-size: 12px; margin: 0 0 12px; }
.content .text { line-height: 1.9; color: #303133; white-space: pre-wrap; }
</style>
