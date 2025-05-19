import axiosInstance from "@/lib/axios"

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
  const response = await axiosInstance.post(`/api/auth/register`, credentials)
  return response.data
}

export const login = async (credentials: AuthCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post(`/api/auth/login`, credentials)
  return response.data
}

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post(`/api/auth/refresh`, { refreshToken })
  return response.data
}
