<template>
  <el-card>
    <el-tabs v-model="tab">
      <!-- 个人资料 -->
      <el-tab-pane label="个人资料" name="profile">
        <el-form :model="profile" label-width="90px" style="max-width:480px">
          <el-form-item label="用户名"><el-input :model-value="profile.username" disabled /></el-form-item>
          <el-form-item label="昵称"><el-input v-model="profile.nickname" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="profile.phone" /></el-form-item>
          <el-form-item label="邮箱"><el-input v-model="profile.email" /></el-form-item>
          <el-form-item label="积分">{{ profile.integration }}</el-form-item>
          <el-button type="primary" @click="saveProfile">保存资料</el-button>
        </el-form>
      </el-tab-pane>

      <!-- 我的优惠券 -->
      <el-tab-pane label="我的优惠券" name="coupon">
        <h4>我的券</h4>
        <el-row :gutter="16" v-if="myList.length">
          <el-col :span="8" v-for="c in myList" :key="c.memberCouponId">
            <div class="coupon" :class="{ used: c.useStatus !== 0 }">
              <div class="c-name">{{ c.name }}</div>
              <div class="c-desc">{{ c.type === 1 ? (c.amount * 10).toFixed(1) + ' 折' : '满' + c.minPoint + '减' + c.amount }}</div>
              <div class="c-status">{{ c.useStatus === 0 ? '未使用' : c.useStatus === 1 ? '已使用' : '已过期' }}</div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="暂无优惠券" :image-size="70" />

        <h4>领券中心</h4>
        <el-row :gutter="16" v-if="available.length">
          <el-col :span="8" v-for="c in available" :key="c.id">
            <div class="coupon">
              <div class="c-name">{{ c.name }}</div>
              <div class="c-desc">{{ c.type === 1 ? (c.amount * 10).toFixed(1) + ' 折' : '满' + c.minPoint + '减' + c.amount }}</div>
              <el-button size="small" type="danger" @click="receive(c.id)">立即领取</el-button>
            </div>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 收货地址 -->
      <el-tab-pane label="收货地址" name="address">
        <el-button type="primary" style="margin-bottom:12px" @click="openAddr()">新增地址</el-button>
        <el-table :data="addresses" border>
          <el-table-column prop="name" label="收货人" width="120" />
          <el-table-column prop="phoneNumber" label="电话" width="150" />
          <el-table-column label="地址" min-width="260">
            <template #default="{ row }">{{ row.province }}{{ row.city }}{{ row.region }}{{ row.detailAddress }}</template>
          </el-table-column>
          <el-table-column label="默认" width="80">
            <template #default="{ row }"><el-tag v-if="row.defaultStatus === 1" type="success">默认</el-tag></template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="openAddr(row)">编辑</el-button>
              <el-button link type="danger" @click="removeAddr(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="addrDialog" :title="addrForm.id ? '编辑地址' : '新增地址'" width="520px">
      <el-form :model="addrForm" label-width="80px">
        <el-form-item label="收货人"><el-input v-model="addrForm.name" /></el-form-item>
        <el-form-item label="电话"><el-input v-model="addrForm.phoneNumber" /></el-form-item>
        <el-row>
          <el-col :span="8"><el-form-item label="省"><el-input v-model="addrForm.province" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="市"><el-input v-model="addrForm.city" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="区"><el-input v-model="addrForm.region" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="详细"><el-input v-model="addrForm.detailAddress" /></el-form-item>
        <el-form-item label="默认"><el-switch v-model="addrForm.defaultStatus" :active-value="1" :inactive-value="0" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addrDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAddr">保存</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getProfile, updateProfile, myCoupons, availableCoupons, receiveCoupon,
  getAddresses, createAddress, updateAddress, deleteAddress
} from '../api/portal'

const tab = ref('profile')
const profile = reactive<any>({})
const myList = ref<any[]>([])
const available = ref<any[]>([])
const addresses = ref<any[]>([])
const addrDialog = ref(false)
const addrForm = reactive<any>({})

async function loadProfile() {
  const r: any = await getProfile()
  Object.assign(profile, r.data)
}
async function saveProfile() {
  await updateProfile({ nickname: profile.nickname, phone: profile.phone, email: profile.email })
  ElMessage.success('保存成功')
}
async function loadCoupons() {
  const [m, a]: any = await Promise.all([myCoupons(), availableCoupons()])
  myList.value = m.data
  available.value = a.data
}
async function receive(id: number) {
  await receiveCoupon(id)
  ElMessage.success('领取成功')
  loadCoupons()
}
async function loadAddresses() {
  const r: any = await getAddresses()
  addresses.value = r.data
}
function openAddr(row?: any) {
  Object.assign(addrForm, row ? { ...row } : {
    id: null, name: '', phoneNumber: '', province: '', city: '', region: '', detailAddress: '', defaultStatus: 0
  })
  addrDialog.value = true
}
async function saveAddr() {
  if (!addrForm.name || !addrForm.phoneNumber) { ElMessage.warning('请填写收货人和电话'); return }
  if (addrForm.id) await updateAddress(addrForm.id, { ...addrForm })
  else await createAddress({ ...addrForm })
  ElMessage.success('保存成功')
  addrDialog.value = false
  loadAddresses()
}
async function removeAddr(row: any) {
  await ElMessageBox.confirm('确认删除该地址？', '提示', { type: 'warning' })
  await deleteAddress(row.id)
  ElMessage.success('已删除')
  loadAddresses()
}

onMounted(() => {
  loadProfile()
  loadCoupons()
  loadAddresses()
})
</script>

<style scoped>
h4 { margin: 16px 0 10px; }
.coupon { border: 1px dashed #f56c6c; border-radius: 8px; padding: 14px; margin-bottom: 14px; background: #fef0f0; }
.coupon.used { opacity: .55; border-color: #c0c4cc; background: #f5f7fa; }
.c-name { font-weight: 600; color: #303133; }
.c-desc { color: #f56c6c; margin: 6px 0; font-size: 14px; }
.c-status { color: #909399; font-size: 12px; }
</style>
