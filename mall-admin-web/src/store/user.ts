import { defineStore } from 'pinia'
import { adminLogin } from '../api/admin'

export const useUserStore = defineStore('adminUser', {
  state: () => ({
    token: localStorage.getItem('admin_token') || '',
    username: localStorage.getItem('admin_username') || '',
    nickName: localStorage.getItem('admin_nick') || '',
    menus: JSON.parse(localStorage.getItem('admin_menus') || '[]')
  }),
  actions: {
    async login(payload: { username: string; password: string }) {
      const r: any = await adminLogin(payload)
      const d = r.data
      this.token = d.token
      this.username = d.username
      this.nickName = d.nickName
      this.menus = d.menus || []
      localStorage.setItem('admin_token', this.token)
      localStorage.setItem('admin_username', this.username)
      localStorage.setItem('admin_nick', this.nickName || '')
      localStorage.setItem('admin_menus', JSON.stringify(this.menus))
    },
    logout() {
      this.token = ''
      this.username = ''
      this.nickName = ''
      this.menus = []
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_username')
      localStorage.removeItem('admin_nick')
      localStorage.removeItem('admin_menus')
    }
  }
})
