import api from "../services/api-client";
import type { UserRole, Language, PaginatedResponse, User } from "../types";

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  language: Language;
  agencyId?: string;
  isActive?: boolean;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: UserRole;
  language?: Language;
  agencyId?: string;
}

export interface SearchUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  agencyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const usersApi = {
  // Get all users with pagination and filters
  getAll: async (params?: SearchUsersParams) => {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  // Get single user
  getOne: async (id: string) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Create user
  create: async (data: CreateUserData) => {
    const response = await api.post<{ message: string; user: User }>('/users', data);
    return response.data;
  },

  // Update user
  update: async (id: string, data: UpdateUserData) => {
    const response = await api.patch<{ message: string; user: User }>(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/users/${id}`);
    return response.data;
  },

  // Activate user
  activate: async (id: string) => {
    const response = await api.patch<{ message: string; user: User }>(`/users/${id}/activate`);
    return response.data;
  },

  // Deactivate user
  deactivate: async (id: string) => {
    const response = await api.patch<{ message: string; user: User }>(`/users/${id}/deactivate`);
    return response.data;
  },
};