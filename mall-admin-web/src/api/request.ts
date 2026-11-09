import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = 'Bearer ' + token
  }
  return config
})

request.interceptors.response.use(
  (resp) => {
    const r = resp.data
    if (r.code !== 200) {
      ElMessage.error(r.message || '请求失败')
      if (r.code === 401) {
        localStorage.removeItem('admin_token')
        router.push('/login')
      }
      return Promise.reject(new Error(r.message || 'error'))
    }
    return r
  },
  (err) => {
    ElMessage.error(err?.message || '网络异常')
    return Promise.reject(err)
  }
)

export default request
