<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <div class="brand">
        <h2>mall 后台管理系统</h2>
        <p>Vue 3 + Spring Boot</p>
      </div>
      <el-form :model="form" @keyup.enter="submit">
        <el-form-item>
          <el-input v-model="form.username" placeholder="用户名" size="large" :prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="submit">登 录</el-button>
      </el-form>
      <div class="hint">默认账号：admin / 123456</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../store/user'

const router = useRouter()
const store = useUserStore()
const loading = ref(false)
const form = reactive({ username: 'admin', password: '123456' })

async function submit() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  try {
    await store.login({ username: form.username, password: form.password })
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (e) {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1f2d3d 0%, #409eff 100%);
}
.login-card { width: 380px; padding: 8px; border-radius: 12px; }
.brand { text-align: center; margin-bottom: 24px; }
.brand h2 { margin: 0; color: #303133; }
.brand p { margin: 6px 0 0; color: #909399; font-size: 13px; }
.hint { margin-top: 14px; text-align: center; color: #909399; font-size: 12px; }
</style>
