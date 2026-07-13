export interface User {
  id: number
  username: string
  email: string
  role: string[]
  bearer_token: string | null
  auth: boolean
}

export interface LoginResponse {
  status: boolean
  message: string
}

export interface ProfileResponse {
  user: User
}
