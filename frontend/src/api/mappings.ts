import { apiClient } from './client';
import {
  PatientDoctorMapping,
  AssignedDoctor,
  PaginatedResponse,
} from '../types';

export interface CreateMappingPayload {
  patient: number; // Patient ID
  doctor: number;  // Doctor ID
}

export const mappingsApi = {
  /**
   * Retrieves all doctor-patient mappings for the authenticated user.
   * Handles both paginated responses and arrays.
   */
  async getMappings(page: number = 1): Promise<{ results: PatientDoctorMapping[]; count: number; next: string | null; previous: string | null }> {
    const response = await apiClient.get<PaginatedResponse<PatientDoctorMapping> | PatientDoctorMapping[]>('/mappings/', {
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

  /**
   * Assigns a doctor to an owned patient.
   */
  async createMapping(payload: CreateMappingPayload): Promise<PatientDoctorMapping> {
    const response = await apiClient.post<PatientDoctorMapping>('/mappings/', payload);
    return response.data;
  },

  /**
   * Retrieves all doctors assigned to a specific owned patient.
   * NOTE: The parameter is the PATIENT ID.
   */
  async getAssignedDoctorsByPatientId(patientId: number): Promise<AssignedDoctor[]> {
    const response = await apiClient.get<AssignedDoctor[]>(`/mappings/${patientId}/`);
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Deletes a doctor-patient assignment by its mapping record ID.
   * NOTE: The parameter is the MAPPING ID, not the patient ID.
   */
  async deleteMappingById(mappingId: number): Promise<void> {
    await apiClient.delete(`/mappings/${mappingId}/`);
  },
};
