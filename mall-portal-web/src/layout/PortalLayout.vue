<template>
  <div class="portal">
    <header class="header">
      <div class="inner">
        <div class="logo" @click="$router.push('/')">mall 商城</div>
        <nav class="nav">
          <router-link to="/" exact-active-class="active">首页</router-link>
          <router-link to="/products" active-class="active">全部商品</router-link>
          <router-link to="/cart" active-class="active">购物车</router-link>
          <router-link to="/orders" active-class="active">我的订单</router-link>
          <router-link to="/member" active-class="active">会员中心</router-link>
          <router-link to="/service" active-class="active">客户服务</router-link>
          <router-link to="/help" active-class="active">帮助中心</router-link>
        </nav>
        <div class="search">
          <el-input v-model="kw" placeholder="搜索商品" clearable @keyup.enter="doSearch">
            <template #append><el-button :icon="Search" @click="doSearch" /></template>
          </el-input>
        </div>
        <div class="user">
          <template v-if="store.isLogin">
            <span class="nick">{{ store.nickname || store.username }}</span>
            <el-button link @click="logout">退出</el-button>
          </template>
          <template v-else>
            <el-button link type="primary" @click="$router.push('/login')">登录</el-button>
            <el-button link @click="$router.push('/login?tab=register')">注册</el-button>
          </template>
        </div>
      </div>
    </header>
    <main class="main"><router-view /></main>
    <footer class="footer">mall 商城 · Vue 3 + Spring Boot 演示项目</footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { useMemberStore } from '../store/member'

const router = useRouter()
const store = useMemberStore()
const kw = ref('')

function doSearch() {
  router.push({ path: '/products', query: { keyword: kw.value } })
}
function logout() {
  store.logout()
  router.push('/')
}
</script>

<style scoped>
.portal { min-height: 100%; display: flex; flex-direction: column; }
.header { background: #fff; box-shadow: 0 1px 6px rgba(0,0,0,.06); position: sticky; top: 0; z-index: 10; }
.inner { max-width: 1200px; margin: 0 auto; height: 64px; display: flex; align-items: center; gap: 24px; padding: 0 16px; }
.logo { font-size: 20px; font-weight: 700; color: #409eff; cursor: pointer; }
.nav { display: flex; gap: 18px; flex: 1; }
.nav a { color: #606266; font-size: 15px; padding: 4px 0; }
.nav a.active { color: #409eff; font-weight: 600; border-bottom: 2px solid #409eff; }
.search { width: 260px; }
.user { display: flex; align-items: center; gap: 8px; }
.nick { color: #303133; font-size: 14px; }
.main { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 20px 16px; }
.footer { text-align: center; color: #909399; font-size: 12px; padding: 20px; }
</style>
