"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  username: string
  token: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Static credentials for testing
const STATIC_USERS = [
  { username: 'admin', password: '12345' }
]

// Simple JWT-like token generator (for demo purposes)
function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  }
  return btoa(JSON.stringify(payload))
}

function validateToken(token: string): { valid: boolean; username?: string } {
  try {
    const payload = JSON.parse(atob(token))
    if (payload.exp > Date.now()) {
      return { valid: true, username: payload.username }
    }
  } catch {
    // Invalid token
  }
  return { valid: false }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      const { valid, username } = validateToken(storedToken)
      if (valid && username) {
        setUser({ username, token: storedToken })
      } else {
        localStorage.removeItem('auth_token')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Check static credentials first
    const staticUser = STATIC_USERS.find(
      u => u.username === username && u.password === password
    )
    
    if (staticUser) {
      const token = generateToken(username)
      localStorage.setItem('auth_token', token)
      setUser({ username, token })
      return true
    }

    // Check stored users (for signup functionality)
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const foundUser = storedUsers.find(
      (u: { username: string; password: string }) => 
        u.username === username && u.password === password
    )

    if (foundUser) {
      const token = generateToken(username)
      localStorage.setItem('auth_token', token)
      setUser({ username, token })
      return true
    }

    return false
  }

  const signup = async (username: string, password: string): Promise<boolean> => {
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]')
    const existingUser = storedUsers.find(
      (u: { username: string }) => u.username === username
    )

    if (existingUser || STATIC_USERS.some(u => u.username === username)) {
      return false
    }

    // Store new user
    storedUsers.push({ username, password })
    localStorage.setItem('users', JSON.stringify(storedUsers))

    // Auto login after signup
    const token = generateToken(username)
    localStorage.setItem('auth_token', token)
    setUser({ username, token })
    return true
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
