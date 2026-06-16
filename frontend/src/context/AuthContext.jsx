import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token'))
  const [role,  setRole]  = useState(() => sessionStorage.getItem('admin_role') || 'admin')

  const login = useCallback((newToken, newRole = 'admin') => {
    sessionStorage.setItem('admin_token', newToken)
    sessionStorage.setItem('admin_role',  newRole)
    setToken(newToken)
    setRole(newRole)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('admin_token')
    sessionStorage.removeItem('admin_role')
    setToken(null)
    setRole('admin')
  }, [])

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated: !!token, isAdmin: role === 'admin', login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
