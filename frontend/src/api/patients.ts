import { apiClient } from './client';
import { Patient, PatientPayload, PaginatedResponse } from '../types';

export const patientsApi = {
  /**
   * Retrieves patients list. Handles both paginated DRF responses and plain arrays.
   */
  async getPatients(page: number = 1): Promise<{ results: Patient[]; count: number; next: string | null; previous: string | null }> {
    const response = await apiClient.get<PaginatedResponse<Patient> | Patient[]>('/patients/', {
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

  async getPatient(id: number): Promise<Patient> {
    const response = await apiClient.get<Patient>(`/patients/${id}/`);
    return response.data;
  },

  async createPatient(payload: PatientPayload): Promise<Patient> {
    const response = await apiClient.post<Patient>('/patients/', payload);
    return response.data;
  },

  async updatePatient(id: number, payload: Partial<PatientPayload>): Promise<Patient> {
    const response = await apiClient.patch<Patient>(`/patients/${id}/`, payload);
    return response.data;
  },

  async deletePatient(id: number): Promise<void> {
    await apiClient.delete(`/patients/${id}/`);
  },
};
