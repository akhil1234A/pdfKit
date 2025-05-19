"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"
import { login, register, refreshToken } from "@/lib/api/auth"

type User = {
  id: string
  email: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken")

      if (token) {
        try {
          // For simplicity, we're just checking if token exists
          // In a real app, you might want to validate the token or use the refresh token
          const userData = JSON.parse(localStorage.getItem("user") || "{}")
          setUser(userData)
        } catch (error) {
          console.error("Authentication error:", error)
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
        }
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Redirect to login if not authenticated and trying to access protected routes
  useEffect(() => {
    if (!isLoading && !user) {
      const protectedRoutes = ["/dashboard", "/upload", "/my-files", "/pdf"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname?.startsWith(route))

      if (isProtectedRoute) {
        router.push("/login")
        toast.error("Authentication required. Please login to access this page.")
      }
    }
  }, [isLoading, user, pathname, router])

  // Handle login
  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await login({ email, password })

      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.user))

      setUser(response.user)
      router.push("/dashboard")

      toast.success("Login successful. Welcome back!")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Invalid email or password.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle registration
  const handleRegister = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await register({ email, password })

      localStorage.setItem("accessToken", response.accessToken)
      localStorage.setItem("refreshToken", response.refreshToken)
      localStorage.setItem("user", JSON.stringify(response.user))

      setUser(response.user)
      router.push("/dashboard")

      toast.success("Registration successful. Your account has been created.")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Registration failed. Could not create your account.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")

    toast.success("You have been logged out successfully.")
  }

  // Setup token refresh
  useEffect(() => {
    if (!user) return

    const refreshAccessToken = async () => {
      try {
        const refreshTokenValue = localStorage.getItem("refreshToken")
        if (!refreshTokenValue) throw new Error("No refresh token")

        const response = await refreshToken(refreshTokenValue)
        localStorage.setItem("accessToken", response.accessToken)

        // Optionally update refresh token if the API returns a new one
        if (response.refreshToken) {
          localStorage.setItem("refreshToken", response.refreshToken)
        }
      } catch (error) {
        console.error("Token refresh error:", error)
        handleLogout()
      }
    }

    // Refresh token every 14 minutes (assuming 15 min expiry)
    const intervalId = setInterval(refreshAccessToken, 14 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [user])

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
