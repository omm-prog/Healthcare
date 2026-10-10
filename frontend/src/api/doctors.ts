import { apiClient } from './client';
import { Doctor, DoctorPayload, PaginatedResponse } from '../types';

export const doctorsApi = {
  /**
   * Retrieves doctors list. Handles both paginated DRF responses and plain arrays.
   */
  async getDoctors(page: number = 1): Promise<{ results: Doctor[]; count: number; next: string | null; previous: string | null }> {
    const response = await apiClient.get<PaginatedResponse<Doctor> | Doctor[]>('/doctors/', {
      params: { page },
    });

    if (Array.isArray(response.data)) {
      return {
        results: response.data,
        count: response.data.length,
        next: null,
        previous: null,
      };
    }

    return {
      results: response.data.results || [],
      count: response.data.count || 0,
      next: response.data.next,
      previous: response.data.previous,
    };
  },

  async getDoctor(id: number): Promise<Doctor> {
    const response = await apiClient.get<Doctor>(`/doctors/${id}/`);
    return response.data;
  },

  async createDoctor(payload: DoctorPayload): Promise<Doctor> {
    const response = await apiClient.post<Doctor>('/doctors/', payload);
    return response.data;
  },

  async updateDoctor(id: number, payload: Partial<DoctorPayload>): Promise<Doctor> {
    const response = await apiClient.patch<Doctor>(`/doctors/${id}/`, payload);
    return response.data;
  },

  async deleteDoctor(id: number): Promise<void> {
    await apiClient.delete(`/doctors/${id}/`);
  },
};
