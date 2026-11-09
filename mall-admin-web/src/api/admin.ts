import request from './request'

// ---------- auth ----------
export const adminLogin = (data: any) => request.post('/admin/login', data)

// ---------- product ----------
export const getProducts = (params: any) => request.get('/admin/products', { params })
export const getProduct = (id: number) => request.get(`/admin/products/${id}`)
export const createProduct = (data: any) => request.post('/admin/products', data)
export const updateProduct = (id: number, data: any) => request.put(`/admin/products/${id}`, data)
export const deleteProduct = (id: number) => request.delete(`/admin/products/${id}`)
export const publishProduct = (id: number, publishStatus: number) =>
  request.put(`/admin/products/${id}/publish`, null, { params: { publishStatus } })

// ---------- category ----------
export const getCategoryTree = () => request.get('/admin/productCategories/tree')
export const createCategory = (data: any) => request.post('/admin/productCategories', data)
export const updateCategory = (id: number, data: any) => request.put(`/admin/productCategories/${id}`, data)
export const deleteCategory = (id: number) => request.delete(`/admin/productCategories/${id}`)

// ---------- brand ----------
export const getBrands = () => request.get('/admin/brands')
export const createBrand = (data: any) => request.post('/admin/brands', data)
export const updateBrand = (id: number, data: any) => request.put(`/admin/brands/${id}`, data)
export const deleteBrand = (id: number) => request.delete(`/admin/brands/${id}`)

// ---------- order ----------
export const getOrders = (params: any) => request.get('/admin/orders', { params })
export const getOrderDetail = (id: number) => request.get(`/admin/orders/${id}`)
export const deliverOrder = (id: number, data: { deliveryCompany?: string; deliverySn?: string; note?: string }) =>
  request.post(`/admin/orders/${id}/deliver`, data)
export const deleteOrder = (id: number) => request.delete(`/admin/orders/${id}`)

// ---------- user ----------
export const getUsers = (params: any) => request.get('/admin/users', { params })
export const createUser = (data: any) => request.post('/admin/users', data)
export const updateUser = (id: number, data: any) => request.put(`/admin/users/${id}`, data)
export const deleteUser = (id: number) => request.delete(`/admin/users/${id}`)
export const assignRoles = (id: number, roleIds: number[]) => request.post(`/admin/users/${id}/roles`, roleIds)

// ---------- role ----------
export const getRoles = () => request.get('/admin/roles')
export const createRole = (data: any) => request.post('/admin/roles', data)
export const updateRole = (id: number, data: any) => request.put(`/admin/roles/${id}`, data)
export const deleteRole = (id: number) => request.delete(`/admin/roles/${id}`)
export const assignMenus = (id: number, menuIds: number[]) => request.post(`/admin/roles/${id}/menus`, menuIds)
export const assignResources = (id: number, resourceIds: number[]) => request.post(`/admin/roles/${id}/resources`, resourceIds)

// ---------- menu ----------
export const getMenuTree = () => request.get('/admin/menus/tree')
export const getMenus = () => request.get('/admin/menus')
export const createMenu = (data: any) => request.post('/admin/menus', data)
export const updateMenu = (id: number, data: any) => request.put(`/admin/menus/${id}`, data)
export const deleteMenu = (id: number) => request.delete(`/admin/menus/${id}`)

// ---------- resource ----------
export const getResources = () => request.get('/admin/resources')
export const createResource = (data: any) => request.post('/admin/resources', data)
export const updateResource = (id: number, data: any) => request.put(`/admin/resources/${id}`, data)
export const deleteResource = (id: number) => request.delete(`/admin/resources/${id}`)

// ---------------- 会员中心 ----------------
export const getMembers = (params: any) => request.get('/admin/members', { params })
export const getMember = (id: number) => request.get(`/admin/members/${id}`)
export const changeMemberStatus = (id: number, status: number) =>
  request.put(`/admin/members/${id}/status`, null, { params: { status } })
export const updateMember = (id: number, data: any) => request.put(`/admin/members/${id}`, data)
export const getMemberLevels = () => request.get('/admin/memberLevels')
export const createMemberLevel = (data: any) => request.post('/admin/memberLevels', data)
export const updateMemberLevel = (id: number, data: any) => request.put(`/admin/memberLevels/${id}`, data)
export const deleteMemberLevel = (id: number) => request.delete(`/admin/memberLevels/${id}`)

// ---------------- 客户服务 ----------------
export const getTickets = (params: any) => request.get('/admin/tickets', { params })
export const getTicket = (id: number) => request.get(`/admin/tickets/${id}`)
export const getTicketStats = () => request.get('/admin/tickets/stats')
export const replyTicket = (id: number, data: any) => request.post(`/admin/tickets/${id}/reply`, data)
export const changeTicketStatus = (id: number, status: number) =>
  request.put(`/admin/tickets/${id}/status`, null, { params: { status } })
export const deleteTicket = (id: number) => request.delete(`/admin/tickets/${id}`)

// ---------------- 帮助中心 ----------------
export const getHelpCategories = () => request.get('/admin/helpCategories')
export const createHelpCategory = (data: any) => request.post('/admin/helpCategories', data)
export const updateHelpCategory = (id: number, data: any) => request.put(`/admin/helpCategories/${id}`, data)
export const deleteHelpCategory = (id: number) => request.delete(`/admin/helpCategories/${id}`)
export const getHelps = (params: any) => request.get('/admin/helps', { params })
export const getHelp = (id: number) => request.get(`/admin/helps/${id}`)
export const createHelp = (data: any) => request.post('/admin/helps', data)
export const updateHelp = (id: number, data: any) => request.put(`/admin/helps/${id}`, data)
export const deleteHelp = (id: number) => request.delete(`/admin/helps/${id}`)

// ---------------- 统计报表 ----------------
export const getStatisticsOverview = () => request.get('/admin/statistics/overview')
export const getSalesTrend = (days: number) => request.get('/admin/statistics/salesTrend', { params: { days } })
export const getTopProducts = (limit = 8) => request.get('/admin/statistics/topProducts', { params: { limit } })
export const getOrderStatusStat = () => request.get('/admin/statistics/orderStatus')
export const getCategorySales = () => request.get('/admin/statistics/categorySales')

// ---------------- 财务管理 ----------------
export const getFinanceOverview = () => request.get('/admin/finance/overview')
export const getFinanceRecords = (params: any) => request.get('/admin/finance/records', { params })
export const getFinanceDaily = (days: number) => request.get('/admin/finance/daily', { params: { days } })
export const refundRecord = (id: number, remark?: string) =>
  request.post(`/admin/finance/records/${id}/refund`, { remark })

// ---------------- 系统设置 ----------------
export const getSettings = () => request.get('/admin/settings')
export const saveSettings = (data: Record<string, string>) => request.put('/admin/settings', data)
