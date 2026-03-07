import api from "../services/api-client";
import type { PaginatedResponse, Property } from "../types";

export interface CreatePropertyData {
  title: string;
  address: string;
  region: string;
  cadastralNo?: string;
  agencyId: string;
}

export interface UpdatePropertyData {
  title?: string;
  address?: string;
  region?: string;
  cadastralNo?: string;
}

export interface SearchPropertiesParams {
  page?: number;
  limit?: number;
  search?: string;
  region?: string;
  agencyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const propertiesApi = {
  // Get all properties with pagination and filters
  getAll: async (params?: SearchPropertiesParams) => {
    const response = await api.get<PaginatedResponse<Property>>('/properties', { params });
    return response.data;
  },

  // Get single property
  getOne: async (id: string) => {
    const response = await api.get<Property>(`/properties/${id}`);
    return response.data;
  },

  // Create property
  create: async (data: CreatePropertyData) => {
    const response = await api.post<{ message: string; property: Property }>('/properties', data);
    return response.data;
  },

  // Update property
  update: async (id: string, data: UpdatePropertyData) => {
    const response = await api.patch<{ message: string; property: Property }>(`/properties/${id}`, data);
    return response.data;
  },

  // Delete property
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/properties/${id}`);
    return response.data;
  },
};