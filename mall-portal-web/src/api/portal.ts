import request from './request'

// ---------- home / product ----------
export const getHome = () => request.get('/portal/home')
export const searchProducts = (params: any) => request.get('/portal/products/search', { params })
export const getProduct = (id: number) => request.get(`/portal/products/${id}`)
export const getCategoryTree = () => request.get('/portal/products/productCategories/tree')
export const getBrands = () => request.get('/portal/products/brands')

// ---------- member ----------
export const memberRegister = (data: any) => request.post('/portal/members/register', data)
export const memberLogin = (data: any) => request.post('/portal/members/login', data)
export const getProfile = () => request.get('/portal/members/profile')
export const updateProfile = (data: any) => request.put('/portal/members/profile', data)

// ---------- address ----------
export const getAddresses = () => request.get('/portal/addresses')
export const createAddress = (data: any) => request.post('/portal/addresses', data)
export const updateAddress = (id: number, data: any) => request.put(`/portal/addresses/${id}`, data)
export const deleteAddress = (id: number) => request.delete(`/portal/addresses/${id}`)

// ---------- cart ----------
export const getCart = () => request.get('/portal/cart')
export const addToCart = (data: any) => request.post('/portal/cart', data)
export const updateCart = (id: number, quantity: number) => request.put(`/portal/cart/${id}`, null, { params: { quantity } })
export const deleteCart = (id: number) => request.delete(`/portal/cart/${id}`)

// ---------- coupon ----------
export const availableCoupons = () => request.get('/portal/coupons/available')
export const receiveCoupon = (id: number) => request.post(`/portal/coupons/${id}/receive`)
export const myCoupons = (params?: any) => request.get('/portal/coupons', { params })
export const calculateCoupon = (data: any) => request.post('/portal/coupons/calculate', data)

// ---------- order ----------
export const createOrder = (data: any) => request.post('/portal/orders', data)
export const confirmOrder = (id: number) => request.put(`/portal/orders/${id}/confirm`)
export const prepayOrder = (id: number) => request.put(`/portal/orders/${id}/prepay`)
export const payOrder = (id: number) => request.post(`/portal/orders/${id}/pay`)
export const cancelOrder = (id: number) => request.put(`/portal/orders/${id}/cancel`)
export const myOrders = (params?: any) => request.get('/portal/orders', { params })
export const orderDetail = (id: number) => request.get(`/portal/orders/${id}`)

// ---------- help center ----------
export const getHelpCategories = () => request.get('/portal/help/categories')
export const getHelps = (params?: any) => request.get('/portal/help', { params })
export const getHelpDetail = (id: number) => request.get(`/portal/help/${id}`)

// ---------- customer service ----------
export const createTicket = (data: any) => request.post('/portal/tickets', data)
export const myTickets = () => request.get('/portal/tickets')
export const getTicket = (id: number) => request.get(`/portal/tickets/${id}`)

// ---------- site settings ----------
export const getSiteSettings = () => request.get('/portal/settings')
