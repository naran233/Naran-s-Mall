<template>
  <div>
    <el-row :gutter="16">
      <el-col :span="8" v-for="c in cards" :key="c.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat">
            <el-icon :size="36" :color="c.color"><component :is="c.icon" /></el-icon>
            <div>
              <div class="stat-title">{{ c.title }}</div>
              <div class="stat-desc">{{ c.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card class="welcome">
      <h3>欢迎使用 mall 商城后台管理系统</h3>
      <p>技术栈：Vue 3 + Vite + Element Plus + Pinia + Axios ｜ Spring Boot 3 + MyBatis-Plus + MySQL + Redis + JWT</p>
      <p>左侧菜单可进入商品管理、订单管理、权限管理（用户 / 角色 / 菜单 / 资源）。</p>
      <p>前台商城请访问 mall-portal-web（默认端口 5174）。</p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { Goods, List, User } from '@element-plus/icons-vue'
const cards = [
  { title: '商品管理', desc: '商品的增删改查与上下架', icon: Goods, color: '#409eff' },
  { title: '订单管理', desc: '订单查询、详情与发货', icon: List, color: '#67c23a' },
  { title: '权限管理', desc: '用户 / 角色 / 菜单 / 资源', icon: User, color: '#e6a23c' }
]
</script>

<style scoped>
.stat-card { margin-bottom: 16px; }
.stat { display: flex; align-items: center; gap: 16px; }
.stat-title { font-size: 15px; font-weight: 600; color: #303133; }
.stat-desc { font-size: 12px; color: #909399; margin-top: 4px; }
.welcome { margin-top: 8px; }
.welcome h3 { margin-top: 0; }
.welcome p { color: #606266; line-height: 1.8; }
</style>
