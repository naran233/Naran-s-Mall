import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../layout/PortalLayout.vue'), children: [
    { path: '', name: 'home', component: () => import('../views/Home.vue') },
    { path: 'products', name: 'products', component: () => import('../views/ProductList.vue') },
    { path: 'product/:id', name: 'productDetail', component: () => import('../views/ProductDetail.vue') },
    { path: 'cart', name: 'cart', component: () => import('../views/Cart.vue'), meta: { auth: true } },
    { path: 'checkout', name: 'checkout', component: () => import('../views/Checkout.vue'), meta: { auth: true } },
    { path: 'orders', name: 'orders', component: () => import('../views/OrderList.vue'), meta: { auth: true } },
    { path: 'member', name: 'member', component: () => import('../views/Member.vue'), meta: { auth: true } },
    { path: 'service', name: 'service', component: () => import('../views/Service.vue'), meta: { auth: true } },
    { path: 'help', name: 'help', component: () => import('../views/Help.vue') }
  ]},
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  if (to.meta.auth && !localStorage.getItem('member_token')) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router
