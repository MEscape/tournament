// Auth Types für Actions und Components

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
}

export interface AccessCodeStatus {
  isValid: boolean
  error?: string
  codeId?: string
}

export interface AccessCodeWithRelations {
  id: string
  code: string
  revoked: boolean
  createdAt: Date
  revokedAt: Date | null
  createdBy: {
    username: string
  }
  user: {
    username: string
    imageUrl: string
  } | null
}

