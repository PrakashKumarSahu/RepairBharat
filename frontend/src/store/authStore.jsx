import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [access, setAccess] = useState(() => localStorage.getItem('access') || null)
  const [refresh, setRefresh] = useState(() => localStorage.getItem('refresh') || null)

  const login = ({ user: u, access: a, refresh: r }) => {
    setUser(u ?? null)
    setAccess(a)
    setRefresh(r)
    localStorage.setItem('access', a)
    localStorage.setItem('refresh', r)
  }

  const logout = () => {
    setUser(null)
    setAccess(null)
    setRefresh(null)
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
  }

  const value = { user, access, refresh, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
