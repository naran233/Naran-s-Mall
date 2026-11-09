import { defineStore } from 'pinia'
import { memberLogin } from '../api/portal'

export const useMemberStore = defineStore('member', {
  state: () => ({
    token: localStorage.getItem('member_token') || '',
    memberId: localStorage.getItem('member_id') || '',
    nickname: localStorage.getItem('member_nick') || '',
    username: localStorage.getItem('member_username') || ''
  }),
  getters: {
    isLogin: (s) => !!s.token
  },
  actions: {
    async login(payload: { username: string; password: string }) {
      const r: any = await memberLogin(payload)
      const d = r.data
      this.token = d.token
      this.memberId = String(d.memberId)
      this.nickname = d.nickname
      this.username = d.username
      localStorage.setItem('member_token', this.token)
      localStorage.setItem('member_id', this.memberId)
      localStorage.setItem('member_nick', this.nickname || '')
      localStorage.setItem('member_username', this.username || '')
    },
    logout() {
      this.token = ''
      this.memberId = ''
      this.nickname = ''
      this.username = ''
      localStorage.removeItem('member_token')
      localStorage.removeItem('member_id')
      localStorage.removeItem('member_nick')
      localStorage.removeItem('member_username')
    }
  }
})
