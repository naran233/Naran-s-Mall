import { create } from 'zustand'
import { memberLogin } from '../api/portal'

interface MemberState {
  token: string
  memberId: string
  nickname: string
  username: string
  login: (payload: { username: string; password: string }) => Promise<void>
  logout: () => void
}

export const useMemberStore = create<MemberState>((set) => ({
  token: localStorage.getItem('member_token') || '',
  memberId: localStorage.getItem('member_id') || '',
  nickname: localStorage.getItem('member_nick') || '',
  username: localStorage.getItem('member_username') || '',

  login: async (payload) => {
    const r = await memberLogin(payload)
    const d: any = r.data
    const state = {
      token: d.token,
      memberId: String(d.memberId),
      nickname: d.nickname || '',
      username: d.username || ''
    }
    localStorage.setItem('member_token', state.token)
    localStorage.setItem('member_id', state.memberId)
    localStorage.setItem('member_nick', state.nickname)
    localStorage.setItem('member_username', state.username)
    set(state)
  },

  logout: () => {
    localStorage.removeItem('member_token')
    localStorage.removeItem('member_id')
    localStorage.removeItem('member_nick')
    localStorage.removeItem('member_username')
    set({ token: '', memberId: '', nickname: '', username: '' })
  }
}))
