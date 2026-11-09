import { http } from './request'

// ---------- auth ----------
export const adminLogin = (data: { username: string; password: string }) => http.post('/admin/login', data)

// ---------- product ----------
export const getProducts = (params: any) => http.get('/admin/products', params)
export const getProduct = (id: number) => http.get(`/admin/products/${id}`)
export const createProduct = (data: any) => http.post('/admin/products', data)
export const updateProduct = (id: number, data: any) => http.put(`/admin/products/${id}`, data)
export const deleteProduct = (id: number) => http.del(`/admin/products/${id}`)
export const publishProduct = (id: number, publishStatus: number) =>
  http.put(`/admin/products/${id}/publish`, null, { params: { publishStatus } })

// ---------- category ----------
export const getCategoryTree = () => http.get('/admin/productCategories/tree')
export const createCategory = (data: any) => http.post('/admin/productCategories', data)
export const updateCategory = (id: number, data: any) => http.put(`/admin/productCategories/${id}`, data)
export const deleteCategory = (id: number) => http.del(`/admin/productCategories/${id}`)

// ---------- brand ----------
export const getBrands = () => http.get('/admin/brands')
export const createBrand = (data: any) => http.post('/admin/brands', data)
export const updateBrand = (id: number, data: any) => http.put(`/admin/brands/${id}`, data)
export const deleteBrand = (id: number) => http.del(`/admin/brands/${id}`)

// ---------- order ----------
export const getOrders = (params: any) => http.get('/admin/orders', params)
export const getOrderDetail = (id: number) => http.get(`/admin/orders/${id}`)
export const deliverOrder = (
  id: number,
  data: { deliveryCompany?: string; deliverySn?: string; note?: string }
) => http.post(`/admin/orders/${id}/deliver`, data)
export const deleteOrder = (id: number) => http.del(`/admin/orders/${id}`)

// ---------- user ----------
export const getUsers = (params: any) => http.get('/admin/users', params)
export const createUser = (data: any) => http.post('/admin/users', data)
export const updateUser = (id: number, data: any) => http.put(`/admin/users/${id}`, data)
export const deleteUser = (id: number) => http.del(`/admin/users/${id}`)
export const assignRoles = (id: number, roleIds: number[]) => http.post(`/admin/users/${id}/roles`, roleIds)

// ---------- role ----------
export const getRoles = () => http.get('/admin/roles')
export const createRole = (data: any) => http.post('/admin/roles', data)
export const updateRole = (id: number, data: any) => http.put(`/admin/roles/${id}`, data)
export const deleteRole = (id: number) => http.del(`/admin/roles/${id}`)
export const assignMenus = (id: number, menuIds: number[]) => http.post(`/admin/roles/${id}/menus`, menuIds)
export const assignResources = (id: number, resourceIds: number[]) =>
  http.post(`/admin/roles/${id}/resources`, resourceIds)

// ---------- menu ----------
export const getMenuTree = () => http.get('/admin/menus/tree')
export const getMenus = () => http.get('/admin/menus')
export const createMenu = (data: any) => http.post('/admin/menus', data)
export const updateMenu = (id: number, data: any) => http.put(`/admin/menus/${id}`, data)
export const deleteMenu = (id: number) => http.del(`/admin/menus/${id}`)

// ---------- resource ----------
export const getResources = () => http.get('/admin/resources')
export const createResource = (data: any) => http.post('/admin/resources', data)
export const updateResource = (id: number, data: any) => http.put(`/admin/resources/${id}`, data)
export const deleteResource = (id: number) => http.del(`/admin/resources/${id}`)

// ---------------- 会员中心 ----------------
export const getMembers = (params: any) => http.get('/admin/members', params)
export const getMember = (id: number) => http.get(`/admin/members/${id}`)
export const changeMemberStatus = (id: number, status: number) =>
  http.put(`/admin/members/${id}/status`, null, { params: { status } })
export const updateMember = (id: number, data: any) => http.put(`/admin/members/${id}`, data)
export const getMemberLevels = () => http.get('/admin/memberLevels')
export const createMemberLevel = (data: any) => http.post('/admin/memberLevels', data)
export const updateMemberLevel = (id: number, data: any) => http.put(`/admin/memberLevels/${id}`, data)
export const deleteMemberLevel = (id: number) => http.del(`/admin/memberLevels/${id}`)

// ---------------- 客户服务 ----------------
export const getTickets = (params: any) => http.get('/admin/tickets', params)
export const getTicket = (id: number) => http.get(`/admin/tickets/${id}`)
export const getTicketStats = () => http.get('/admin/tickets/stats')
export const replyTicket = (id: number, data: any) => http.post(`/admin/tickets/${id}/reply`, data)
export const changeTicketStatus = (id: number, status: number) =>
  http.put(`/admin/tickets/${id}/status`, null, { params: { status } })
export const deleteTicket = (id: number) => http.del(`/admin/tickets/${id}`)

// ---------------- 帮助中心 ----------------
export const getHelpCategories = () => http.get('/admin/helpCategories')
export const createHelpCategory = (data: any) => http.post('/admin/helpCategories', data)
export const updateHelpCategory = (id: number, data: any) => http.put(`/admin/helpCategories/${id}`, data)
export const deleteHelpCategory = (id: number) => http.del(`/admin/helpCategories/${id}`)
export const getHelps = (params: any) => http.get('/admin/helps', params)
export const getHelp = (id: number) => http.get(`/admin/helps/${id}`)
export const createHelp = (data: any) => http.post('/admin/helps', data)
export const updateHelp = (id: number, data: any) => http.put(`/admin/helps/${id}`, data)
export const deleteHelp = (id: number) => http.del(`/admin/helps/${id}`)

// ---------------- 统计报表 ----------------
export const getStatisticsOverview = () => http.get('/admin/statistics/overview')
export const getSalesTrend = (days: number) => http.get('/admin/statistics/salesTrend', { days })
export const getTopProducts = (limit = 8) => http.get('/admin/statistics/topProducts', { limit })
export const getOrderStatusStat = () => http.get('/admin/statistics/orderStatus')
export const getCategorySales = () => http.get('/admin/statistics/categorySales')

// ---------------- 财务管理 ----------------
export const getFinanceOverview = () => http.get('/admin/finance/overview')
export const getFinanceRecords = (params: any) => http.get('/admin/finance/records', params)
export const getFinanceDaily = (days: number) => http.get('/admin/finance/daily', { days })
export const refundRecord = (id: number, remark?: string) =>
  http.post(`/admin/finance/records/${id}/refund`, { remark })

// ---------------- 系统设置 ----------------
export const getSettings = () => http.get('/admin/settings')
export const saveSettings = (data: Record<string, string>) => http.put('/admin/settings', data)
