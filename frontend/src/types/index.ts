export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export type GenderType = 'Male' | 'Female' | 'Other';

export interface Patient {
  id: number;
  owner_id?: number;
  owner_email?: string;
  name: string;
  age: number;
  gender: GenderType;
  email: string;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface PatientPayload {
  name: string;
  age: number;
  gender: GenderType;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  clinic_address: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorPayload {
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  clinic_address?: string;
}

export interface PatientSummary {
  id: number;
  name: string;
  age: number;
  gender: string;
}

export interface DoctorSummary {
  id: number;
  name: string;
  specialization: string;
  phone: string;
  email: string;
}

export interface PatientDoctorMapping {
  id: number;
  patient: PatientSummary;
  doctor: DoctorSummary;
  assigned_at: string;
}

export interface AssignedDoctor {
  mapping_id: number;
  doctor: DoctorSummary;
  assigned_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiFieldErrors {
  [key: string]: string[] | string;
}
