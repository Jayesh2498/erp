import React, { createContext, useContext, useEffect, useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff' | 'viewer'
  avatarInitials: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  stateCode: string
}

interface AuthContextValue {
  user: User | null
  workspace: Workspace | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (workspaceSlug: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  workspace: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
})

const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'admin@demo.com': {
    password: 'demo1234',
    user: { id: 'u-1', name: 'Tony Stark', email: 'admin@demo.com', role: 'admin', avatarInitials: 'TS' },
  },
  'manager@demo.com': {
    password: 'demo1234',
    user: { id: 'u-2', name: 'Pepper Potts', email: 'manager@demo.com', role: 'manager', avatarInitials: 'PP' },
  },
  'staff@demo.com': {
    password: 'demo1234',
    user: { id: 'u-3', name: 'Happy Hogan', email: 'staff@demo.com', role: 'staff', avatarInitials: 'HH' },
  },
}

const MOCK_WORKSPACE: Workspace = {
  id: 'ws-demo',
  name: 'Stark Industries Pvt Ltd',
  slug: 'DEMO',
  stateCode: '27',
}

const AUTH_STORAGE_KEY = 'erp_auth'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) {
          const { user: u, workspace: w } = JSON.parse(stored)
          setUser(u)
          setWorkspace(w)
        }
      } catch {
        // ignore
      }
      setIsLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  const login = async (workspaceSlug: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600))

    const slug = workspaceSlug.trim().toUpperCase()
    if (slug !== 'DEMO') {
      throw new Error('Workspace not found. Try "DEMO".')
    }

    const record = MOCK_USERS[email.toLowerCase().trim()]
    if (!record) {
      throw new Error('No account found with that email.')
    }
    if (record.password !== password) {
      throw new Error('Incorrect password.')
    }

    setUser(record.user)
    setWorkspace(MOCK_WORKSPACE)
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: record.user, workspace: MOCK_WORKSPACE }))
  }

  const logout = () => {
    setUser(null)
    setWorkspace(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{
      user,
      workspace,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext)
}
