<template>
  <div v-loading="loading">
    <el-card>
      <template #header><b>系统设置</b></template>
      <el-form :model="form" label-width="140px" style="max-width:720px">
        <el-divider content-position="left">站点信息</el-divider>
        <el-form-item label="站点名称">
          <el-input v-model="form.site_name" placeholder="mall 商城" />
        </el-form-item>
        <el-form-item label="站点 Logo">
          <el-input v-model="form.site_logo" placeholder="图片地址，如 /images/brands/xiaomi.svg" />
        </el-form-item>
        <el-form-item label="站点简介">
          <el-input v-model="form.site_description" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="备案号">
          <el-input v-model="form.icp" />
        </el-form-item>

        <el-divider content-position="left">客服信息</el-divider>
        <el-form-item label="客服电话">
          <el-input v-model="form.service_phone" />
        </el-form-item>
        <el-form-item label="客服邮箱">
          <el-input v-model="form.service_email" />
        </el-form-item>

        <el-divider content-position="left">交易设置</el-divider>
        <el-form-item label="包邮门槛（元）">
          <el-input-number v-model="freeFreight" :min="0" :precision="2" />
          <span class="tip">满该金额订单包邮</span>
        </el-form-item>
        <el-form-item label="未支付自动取消（分钟）">
          <el-input-number v-model="autoCancel" :min="0" />
          <span class="tip">0 表示不自动取消</span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="saving" @click="save">保存设置</el-button>
          <el-button @click="load">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSettings, saveSettings } from '../../api/admin'

const loading = ref(false)
const saving = ref(false)
const form = reactive<Record<string, string>>({})
const freeFreight = ref(99)
const autoCancel = ref(30)

async function load() {
  loading.value = true
  try {
    const r: any = await getSettings()
    const map: Record<string, string> = {}
    ;(r.data as any[]).forEach(s => { map[s.settingKey] = s.settingValue ?? '' })
    Object.keys(form).forEach(k => delete form[k])
    Object.assign(form, map)
    freeFreight.value = Number(map.free_freight_threshold || 0)
    autoCancel.value = Number(map.order_auto_cancel_minutes || 0)
  } finally { loading.value = false }
}

async function save() {
  saving.value = true
  try {
    await saveSettings({
      ...form,
      free_freight_threshold: String(freeFreight.value),
      order_auto_cancel_minutes: String(autoCancel.value)
    })
    ElMessage.success('设置已保存')
  } finally { saving.value = false }
}

onMounted(load)
</script>

<style scoped>
.tip { margin-left: 10px; color: #909399; font-size: 12px; }
</style>
