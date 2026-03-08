import api from "../services/api-client";
import type { PaginatedResponse } from "../types";

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  action: string;
  entity: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SearchAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const auditLogApi = {
  // Get all audit logs with filters
  getAll: async (params?: SearchAuditLogsParams) => {
    const response = await api.get<PaginatedResponse<AuditLog>>('/audit-logs', { params });
    return response.data;
  },

  // Get logs by entity
  getByEntity: async (entity: string, entityId: string) => {
    const response = await api.get<AuditLog[]>(`/audit-logs/entity/${entity}/${entityId}`);
    return response.data;
  },

  // Get logs by user
  getByUser: async (userId: string) => {
    const response = await api.get<AuditLog[]>(`/audit-logs/user/${userId}`);
    return response.data;
  },
};