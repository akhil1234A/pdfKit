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
