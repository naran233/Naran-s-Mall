import { http } from './request'

// ---------- home / product ----------
export const getHome = () => http.get('/portal/home')
export const searchProducts = (params: any) => http.get('/portal/products/search', params)
export const getProduct = (id: number) => http.get(`/portal/products/${id}`)
export const getCategoryTree = () => http.get('/portal/products/productCategories/tree')
export const getBrands = () => http.get('/portal/products/brands')

// ---------- member ----------
export const memberRegister = (data: any) => http.post('/portal/members/register', data)
export const memberLogin = (data: any) => http.post('/portal/members/login', data)
export const getProfile = () => http.get('/portal/members/profile')
export const updateProfile = (data: any) => http.put('/portal/members/profile', data)

// ---------- address ----------
export const getAddresses = () => http.get('/portal/addresses')
export const createAddress = (data: any) => http.post('/portal/addresses', data)
export const updateAddress = (id: number, data: any) => http.put(`/portal/addresses/${id}`, data)
export const deleteAddress = (id: number) => http.del(`/portal/addresses/${id}`)

// ---------- cart ----------
export const getCart = () => http.get('/portal/cart')
export const addToCart = (data: any) => http.post('/portal/cart', data)
export const updateCart = (id: number, quantity: number) =>
  http.put(`/portal/cart/${id}`, null, { params: { quantity } })
export const deleteCart = (id: number) => http.del(`/portal/cart/${id}`)

// ---------- coupon ----------
export const availableCoupons = () => http.get('/portal/coupons/available')
export const receiveCoupon = (id: number) => http.post(`/portal/coupons/${id}/receive`)
export const myCoupons = (params?: any) => http.get('/portal/coupons', params)
export const calculateCoupon = (data: any) => http.post('/portal/coupons/calculate', data)

// ---------- order ----------
export const createOrder = (data: any) => http.post('/portal/orders', data)
export const confirmOrder = (id: number) => http.put(`/portal/orders/${id}/confirm`)
export const prepayOrder = (id: number) => http.put(`/portal/orders/${id}/prepay`)
export const payOrder = (id: number) => http.post(`/portal/orders/${id}/pay`)
export const cancelOrder = (id: number) => http.put(`/portal/orders/${id}/cancel`)
export const myOrders = (params?: any) => http.get('/portal/orders', params)
export const orderDetail = (id: number) => http.get(`/portal/orders/${id}`)

// ---------- help center ----------
export const getHelpCategories = () => http.get('/portal/help/categories')
export const getHelps = (params?: any) => http.get('/portal/help', params)
export const getHelpDetail = (id: number) => http.get(`/portal/help/${id}`)

// ---------- customer service ----------
export const createTicket = (data: any) => http.post('/portal/tickets', data)
export const myTickets = () => http.get('/portal/tickets')
export const getTicket = (id: number) => http.get(`/portal/tickets/${id}`)

// ---------- site settings ----------
export const getSiteSettings = () => http.get('/portal/settings')
