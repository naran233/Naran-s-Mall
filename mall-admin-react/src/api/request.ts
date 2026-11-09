import axios, { AxiosRequestConfig } from 'axios'
import { message } from 'antd'

export interface ApiResult<T = any> {
  code: number
  message: string
  data: T
}

const request = axios.create({ baseURL: '/api', timeout: 15000 })

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

request.interceptors.response.use(
  (resp) => {
    const r = resp.data
    if (r.code !== 200) {
      message.error(r.message || '请求失败')
      if (r.code === 401) {
        localStorage.removeItem('admin_token')
        if (!location.pathname.startsWith('/login')) location.href = '/login'
      }
      return Promise.reject(new Error(r.message || 'error'))
    }
    return r
  },
  (err) => {
    message.error(err?.message || '网络异常')
    return Promise.reject(err)
  }
)

export const http = {
  get: <T = any>(url: string, params?: any, config?: AxiosRequestConfig) =>
    request.get<any, ApiResult<T>>(url, { params, ...config }),
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request.post<any, ApiResult<T>>(url, data, config),
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request.put<any, ApiResult<T>>(url, data, config),
  del: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request.delete<any, ApiResult<T>>(url, config)
}

export default request
