// Temporary implementation for Cline account types

export interface UserOrganization {
  id: string
  name: string
  // Add other fields as needed
  [key: string]: any
}

export const UserOrganization = {
  create: (data: any): UserOrganization => data
}

export interface User {
  id: string
  email: string
  // Add other fields as needed
  [key: string]: any
}

export const User = {
  create: (data: any): User => data
}

export interface OrganizationCredits {
  total: number
  used: number
  available: number
  [key: string]: any
}

export const OrganizationCredits = {
  create: (data: any): OrganizationCredits => data
}

export interface UserCredits {
  total: number
  used: number
  available: number
  [key: string]: any
}

export const UserCredits = {
  create: (data: any): UserCredits => data
}