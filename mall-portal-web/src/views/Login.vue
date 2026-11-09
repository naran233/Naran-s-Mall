<template>
  <div class="login-wrap">
    <el-card class="login-card">
      <div class="brand">
        <h2>mall 商城</h2>
        <p>登录 / 注册</p>
      </div>
      <el-tabs v-model="tab" stretch>
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" @keyup.enter="doLogin">
            <el-form-item><el-input v-model="loginForm.username" placeholder="用户名" size="large" /></el-form-item>
            <el-form-item><el-input v-model="loginForm.password" type="password" placeholder="密码" size="large" show-password /></el-form-item>
            <el-button type="primary" size="large" style="width:100%" :loading="loading" @click="doLogin">登 录</el-button>
          </el-form>
          <div class="hint">演示账号：demo / 123456</div>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="regForm" @keyup.enter="doRegister">
            <el-form-item><el-input v-model="regForm.username" placeholder="用户名" size="large" /></el-form-item>
            <el-form-item><el-input v-model="regForm.password" type="password" placeholder="密码" size="large" show-password /></el-form-item>
            <el-form-item><el-input v-model="regForm.nickname" placeholder="昵称（可选）" size="large" /></el-form-item>
            <el-form-item><el-input v-model="regForm.phone" placeholder="手机号（可选）" size="large" /></el-form-item>
            <el-button type="success" size="large" style="width:100%" :loading="loading" @click="doRegister">注 册</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div class="back"><el-button link @click="$router.push('/')">← 返回商城首页</el-button></div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useMemberStore } from '../store/member'
import { memberRegister } from '../api/portal'

const route = useRoute()
const router = useRouter()
const store = useMemberStore()
const tab = ref((route.query.tab as string) === 'register' ? 'register' : 'login')
const loading = ref(false)
const loginForm = reactive({ username: 'demo', password: '123456' })
const regForm = reactive({ username: '', password: '', nickname: '', phone: '' })

async function doLogin() {
  if (!loginForm.username || !loginForm.password) { ElMessage.warning('请输入用户名和密码'); return }
  loading.value = true
  try {
    await store.login({ ...loginForm })
    ElMessage.success('登录成功')
    router.push((route.query.redirect as string) || '/')
  } finally { loading.value = false }
}

async function doRegister() {
  if (!regForm.username || !regForm.password) { ElMessage.warning('请输入用户名和密码'); return }
  loading.value = true
  try {
    await memberRegister({ ...regForm })
    ElMessage.success('注册成功，请登录')
    loginForm.username = regForm.username
    loginForm.password = ''
    tab.value = 'login'
  } finally { loading.value = false }
}
</script>

<style scoped>
.login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #409eff 0%, #67c23a 100%); }
.login-card { width: 400px; border-radius: 12px; }
.brand { text-align: center; margin-bottom: 8px; }
.brand h2 { margin: 0; color: #409eff; }
.brand p { margin: 6px 0 0; color: #909399; font-size: 13px; }
.hint { margin-top: 14px; text-align: center; color: #909399; font-size: 12px; }
.back { margin-top: 12px; text-align: center; }
</style>
