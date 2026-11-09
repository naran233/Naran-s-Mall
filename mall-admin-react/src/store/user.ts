import { create } from 'zustand'
import { adminLogin } from '../api/admin'

interface UserState {
  token: string
  username: string
  nickName: string
  menus: any[]
  login: (payload: { username: string; password: string }) => Promise<void>
  logout: () => void
}

const readMenus = () => {
  try {
    return JSON.parse(localStorage.getItem('admin_menus') || '[]')
  } catch {
    return []
  }
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('admin_token') || '',
  username: localStorage.getItem('admin_username') || '',
  nickName: localStorage.getItem('admin_nick') || '',
  menus: readMenus(),

  login: async (payload) => {
    const r = await adminLogin(payload)
    const d: any = r.data
    const state = {
      token: d.token,
      username: d.username,
      nickName: d.nickName || '',
      menus: d.menus || []
    }
    localStorage.setItem('admin_token', state.token)
    localStorage.setItem('admin_username', state.username)
    localStorage.setItem('admin_nick', state.nickName)
    localStorage.setItem('admin_menus', JSON.stringify(state.menus))
    set(state)
  },

  logout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    localStorage.removeItem('admin_nick')
    localStorage.removeItem('admin_menus')
    set({ token: '', username: '', nickName: '', menus: [] })
  }
}))
