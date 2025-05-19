import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export type AuthCredentials = {
  email: string
  password: string
}

export type AuthResponse = {
  user: {
    id: string
    email: string
  }
  accessToken: string
  refreshToken: string
}

export const register = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/register`, credentials)
  return response.data
}

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/login`, credentials)
  return response.data
}

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
  return response.data
}
