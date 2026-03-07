import api from "../services/api-client";
import type { Agency, PaginatedResponse } from "../types";

export interface CreateAgencyData {
  name: string;
  licenseNumber: string;
  address: string;
  region: string;
  status?: 'ACTIVE' | 'CLOSED' | 'BANNED';
}

export interface UpdateAgencyData {
  name?: string;
  licenseNumber?: string;
  address?: string;
  region?: string;
}

export interface SearchAgenciesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'CLOSED' | 'BANNED';
  region?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const agenciesApi = {
  // Get all agencies with pagination and filters
  getAll: async (params?: SearchAgenciesParams) => {
    const response = await api.get<PaginatedResponse<Agency>>('/agencies', { params });
    return response.data;
  },

  // Get single agency
  getOne: async (id: string) => {
    const response = await api.get<Agency>(`/agencies/${id}`);
    return response.data;
  },

  // Create agency
  create: async (data: CreateAgencyData) => {
    const response = await api.post<{ message: string; agency: Agency }>('/agencies', data);
    return response.data;
  },

  // Update agency
  update: async (id: string, data: UpdateAgencyData) => {
    const response = await api.patch<{ message: string; agency: Agency }>(`/agencies/${id}`, data);
    return response.data;
  },

  // Delete agency
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/agencies/${id}`);
    return response.data;
  },

  // Ban agency
  ban: async (id: string) => {
    const response = await api.patch<{ message: string; agency: Agency }>(`/agencies/${id}/ban`);
    return response.data;
  },

  // Close agency
  close: async (id: string) => {
    const response = await api.patch<{ message: string; agency: Agency }>(`/agencies/${id}/close`);
    return response.data;
  },

  // Activate agency
  activate: async (id: string) => {
    const response = await api.patch<{ message: string; agency: Agency }>(`/agencies/${id}/activate`);
    return response.data;
  },
};