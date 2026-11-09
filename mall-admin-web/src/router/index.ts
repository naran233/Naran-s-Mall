import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../layout/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), meta: { title: '仪表盘' } },
      { path: 'product/list', name: 'productList', component: () => import('../views/product/ProductList.vue'), meta: { title: '商品列表' } },
      { path: 'product/category', name: 'productCategory', component: () => import('../views/product/CategoryList.vue'), meta: { title: '商品分类' } },
      { path: 'product/brand', name: 'brand', component: () => import('../views/product/BrandList.vue'), meta: { title: '品牌管理' } },
      { path: 'order/list', name: 'orderList', component: () => import('../views/order/OrderList.vue'), meta: { title: '订单列表' } },
      { path: 'member/list', name: 'memberList', component: () => import('../views/member/MemberList.vue'), meta: { title: '会员管理' } },
      { path: 'service/ticket', name: 'ticketList', component: () => import('../views/service/TicketList.vue'), meta: { title: '客户服务' } },
      { path: 'cms/help', name: 'helpCenter', component: () => import('../views/cms/HelpCenter.vue'), meta: { title: '帮助中心' } },
      { path: 'report/statistics', name: 'statistics', component: () => import('../views/report/Statistics.vue'), meta: { title: '统计报表' } },
      { path: 'finance/list', name: 'financeList', component: () => import('../views/finance/FinanceList.vue'), meta: { title: '财务管理' } },
      { path: 'setting', name: 'setting', component: () => import('../views/setting/Setting.vue'), meta: { title: '系统设置' } },
      { path: 'sys/user', name: 'user', component: () => import('../views/sys/UserList.vue'), meta: { title: '用户管理' } },
      { path: 'sys/role', name: 'role', component: () => import('../views/sys/RoleList.vue'), meta: { title: '角色管理' } },
      { path: 'sys/menu', name: 'menu', component: () => import('../views/sys/MenuList.vue'), meta: { title: '菜单管理' } },
      { path: 'sys/resource', name: 'resource', component: () => import('../views/sys/ResourceList.vue'), meta: { title: '资源管理' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token')
  if (to.path !== '/login' && !token) return '/login'
  if (to.path === '/login' && token) return '/dashboard'
  return true
})

export default router
