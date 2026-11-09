<template>
  <div v-loading="loading">
    <el-card>
      <template #header><b>确认订单</b></template>

      <h4>收货地址</h4>
      <el-radio-group v-model="selectedAddressId" @change="onAddressChange">
        <div class="addr-list">
          <el-radio v-for="a in addresses" :key="a.id" :label="a.id" border style="margin-bottom:8px;width:100%">
            {{ a.name }} {{ a.phoneNumber }} ｜ {{ a.province }}{{ a.city }}{{ a.region }}{{ a.detailAddress }}
          </el-radio>
          <span v-if="!addresses.length" class="tip">暂无地址，可在下方手动填写</span>
        </div>
      </el-radio-group>

      <el-form :model="receiver" label-width="90px" class="addr-form">
        <el-row>
          <el-col :span="8"><el-form-item label="收货人"><el-input v-model="receiver.receiverName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="电话"><el-input v-model="receiver.receiverPhone" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="省"><el-input v-model="receiver.receiverProvince" /></el-form-item></el-col>
        </el-row>
        <el-row>
          <el-col :span="8"><el-form-item label="市"><el-input v-model="receiver.receiverCity" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="区"><el-input v-model="receiver.receiverRegion" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="详细地址"><el-input v-model="receiver.receiverDetailAddress" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="receiver.note" /></el-form-item>
      </el-form>

      <h4>商品清单</h4>
      <el-table :data="items" border>
        <el-table-column prop="productName" label="商品" min-width="220" />
        <el-table-column label="单价" width="120">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="90" />
        <el-table-column label="小计" width="120">
          <template #default="{ row }">￥{{ (row.price * row.quantity).toFixed(2) }}</template>
        </el-table-column>
      </el-table>

      <h4>优惠券</h4>
      <el-select v-model="memberCouponId" placeholder="不使用优惠券" clearable style="width:320px" @change="calc">
        <el-option v-for="c in coupons" :key="c.memberCouponId"
                   :label="`${c.name}（${c.type === 1 ? (c.amount * 10).toFixed(1) + '折' : '减' + c.amount}，满${c.minPoint}可用）`"
                   :value="c.memberCouponId" />
      </el-select>

      <div class="summary">
        <div>商品总额：￥{{ totalAmount.toFixed(2) }}</div>
        <div>优惠金额：<span class="cut">- ￥{{ discount.toFixed(2) }}</span></div>
        <div class="pay">应付：<span class="price">￥{{ payAmount.toFixed(2) }}</span></div>
      </div>

      <div class="submit">
        <el-button size="large" @click="$router.push('/cart')">返回购物车</el-button>
        <el-button type="danger" size="large" :loading="submitting" @click="submit">提交订单</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCart, getAddresses, myCoupons, calculateCoupon, createOrder } from '../api/portal'

const router = useRouter()
const loading = ref(false)
const submitting = ref(false)
const items = ref<any[]>([])
const addresses = ref<any[]>([])
const coupons = ref<any[]>([])
const selectedAddressId = ref<number | undefined>()
const memberCouponId = ref<number | undefined>()
const discount = ref(0)
const receiver = reactive<any>({
  receiverName: '', receiverPhone: '', receiverProvince: '', receiverCity: '',
  receiverRegion: '', receiverDetailAddress: '', note: ''
})

const cartItemIds = ref<number[]>([])
const totalAmount = computed(() => items.value.reduce((s, r) => s + r.price * r.quantity, 0))
const payAmount = computed(() => Math.max(0, totalAmount.value - discount.value))

function onAddressChange(id: number) {
  const a = addresses.value.find(x => x.id === id)
  if (a) {
    receiver.receiverName = a.name
    receiver.receiverPhone = a.phoneNumber
    receiver.receiverProvince = a.province
    receiver.receiverCity = a.city
    receiver.receiverRegion = a.region
    receiver.receiverDetailAddress = a.detailAddress
  }
}

async function calc() {
  discount.value = 0
  if (!memberCouponId.value) return
  const r: any = await calculateCoupon({ memberCouponId: memberCouponId.value, totalAmount: totalAmount.value })
  discount.value = Number(r.data) || 0
}

async function submit() {
  if (!receiver.receiverName || !receiver.receiverPhone || !receiver.receiverDetailAddress) {
    ElMessage.warning('请完善收货信息')
    return
  }
  submitting.value = true
  try {
    const r: any = await createOrder({
      cartItemIds: cartItemIds.value,
      couponId: memberCouponId.value,
      ...receiver
    })
    ElMessage.success('下单成功，请前往我的订单完成后续流程')
    localStorage.removeItem('checkout_items')
    router.push('/orders')
  } finally { submitting.value = false }
}

onMounted(async () => {
  loading.value = true
  try {
    const ids = JSON.parse(localStorage.getItem('checkout_items') || '[]')
    if (!ids.length) { ElMessage.warning('请先在购物车选择商品'); router.push('/cart'); return }
    cartItemIds.value = ids
    const [cart, addr, cou]: any = await Promise.all([getCart(), getAddresses(), myCoupons({ useStatus: 0 })])
    items.value = (cart.data || []).filter((c: any) => ids.includes(c.id))
    addresses.value = addr.data || []
    coupons.value = cou.data || []
    if (addresses.value.length) {
      const def = addresses.value[0]
      selectedAddressId.value = def.id
      onAddressChange(def.id)
    }
  } finally { loading.value = false }
})
</script>

<style scoped>
h4 { margin: 20px 0 12px; color: #303133; }
.addr-list { width: 100%; }
.tip { color: #909399; font-size: 13px; }
.addr-form { margin-top: 8px; }
.summary { margin-top: 24px; text-align: right; line-height: 2; color: #606266; }
.cut { color: #67c23a; }
.pay .price { color: #f56c6c; font-size: 24px; font-weight: 700; }
.submit { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
</style>
