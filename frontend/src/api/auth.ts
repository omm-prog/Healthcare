import { apiClient } from './client';
import { LoginResponse, RegisterResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register/', payload);
    return response.data;
  },

  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login/', payload);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    const response = await apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
    return response.data;
  },
};
