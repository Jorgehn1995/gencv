
import { defineStore } from 'pinia'
import type { User } from '@/types/app'

interface UserState extends User {}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    uid: null,
    name: null,
    email: null,
    photo: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.uid,
    fullUser: (state): User => ({
      uid: state.uid,
      name: state.name,
      email: state.email,
      photo: state.photo,
    }),
  },
  actions: {
    setUser(uid: string, name: string, email: string, photo: string | null) {
      this.uid = uid
      this.name = name
      this.email = email
      this.photo = photo
    },
    clearUser() {
      this.uid = null
      this.name = null
      this.email = null
      this.photo = null
    },
    updatePhoto(photo: string) {
      this.photo = photo
    },
  },
})
