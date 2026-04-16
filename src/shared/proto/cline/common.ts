// Temporary implementation for Cline proto types

export interface EmptyRequest {
  // Empty request type
}

export const EmptyRequest = {
  create: (): EmptyRequest => ({})
}

export interface StringRequest {
  value: string
}

export const StringRequest = {
  create: (value: string): StringRequest => ({value})
}

export interface BooleanRequest {
  value: boolean
}

export const BooleanRequest = {
  create: (value: boolean): BooleanRequest => ({value})
}

export interface Int64Request {
  value: number
}

export const Int64Request = {
  create: (value: number): Int64Request => ({value})
}

export interface KeyValuePair {
  key: string
  value: string
}

export const KeyValuePair = {
  create: (key: string, value: string): KeyValuePair => ({key, value})
}

// Add other common types as needed
export interface State {
  // Placeholder for State type
  [key: string]: any
}

export const State = {
  create: (data: any): State => data
}

export interface StringArrayRequest {
  values: string[]
}

export const StringArrayRequest = {
  create: (values: string[]): StringArrayRequest => ({values})
}