<template>
  <el-container class="layout">
    <el-aside width="220px" class="aside">
      <div class="logo">mall 商城后台</div>
      <el-menu :default-active="$route.path" router background-color="#1f2d3d" text-color="#bfcbd9"
               active-text-color="#409eff" unique-opened>
        <el-menu-item index="/dashboard"><el-icon><Odometer /></el-icon><span>仪表盘</span></el-menu-item>
        <el-menu-item index="/report/statistics"><el-icon><DataAnalysis /></el-icon><span>统计报表</span></el-menu-item>
        <el-sub-menu index="product">
          <template #title><el-icon><Goods /></el-icon><span>商品管理</span></template>
          <el-menu-item index="/product/list">商品列表</el-menu-item>
          <el-menu-item index="/product/category">商品分类</el-menu-item>
          <el-menu-item index="/product/brand">品牌管理</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="order">
          <template #title><el-icon><List /></el-icon><span>订单管理</span></template>
          <el-menu-item index="/order/list">订单列表</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/member/list"><el-icon><User /></el-icon><span>会员中心</span></el-menu-item>
        <el-menu-item index="/service/ticket"><el-icon><Service /></el-icon><span>客户服务</span></el-menu-item>
        <el-menu-item index="/cms/help"><el-icon><Document /></el-icon><span>帮助中心</span></el-menu-item>
        <el-menu-item index="/finance/list"><el-icon><Money /></el-icon><span>财务管理</span></el-menu-item>
        <el-sub-menu index="sys">
          <template #title><el-icon><Lock /></el-icon><span>权限管理</span></template>
          <el-menu-item index="/sys/user">用户管理</el-menu-item>
          <el-menu-item index="/sys/role">角色管理</el-menu-item>
          <el-menu-item index="/sys/menu">菜单管理</el-menu-item>
          <el-menu-item index="/sys/resource">资源管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/setting"><el-icon><Setting /></el-icon><span>系统设置</span></el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <div class="page-title">{{ $route.meta.title || '仪表盘' }}</div>
        <div class="right">
          <span class="user">{{ store.nickName || store.username }}</span>
          <el-button type="danger" link @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'

const router = useRouter()
const store = useUserStore()

function logout() {
  store.logout()
  router.push('/login')
}
</script>

<style scoped>
.layout { height: 100vh; }
.aside { background: #1f2d3d; overflow-x: hidden; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-weight: 600; font-size: 16px; background: #17232e; }
.aside :deep(.el-menu) { border-right: none; }
.header { background: #fff; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 4px rgba(0,0,0,.06); }
.page-title { font-size: 16px; font-weight: 600; color: #303133; }
.right { display: flex; align-items: center; gap: 12px; }
.user { color: #606266; font-size: 14px; }
.main { background: #f5f7fa; }
</style>
