import api from '../services/api-client';
import { VerificationStatus, TradeType, type PaginatedResponse, type Transaction } from '../types';

export interface CreateTransactionData {
  propertyId: string;
  agencyId: string;
  tradeType: TradeType;
  price: number;
  buyerName: string;
  buyerIdNo?: string;
  sellerName: string;
  sellerIdNo?: string;
}

export interface UpdateTransactionData {
  price?: number;
  buyerName?: string;
  buyerIdNo?: string;
  sellerName?: string;
  sellerIdNo?: string;
}

export interface VerifyTransactionData {
  status: VerificationStatus;
  remarks?: string;
}

export interface SearchTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VerificationStatus;
  tradeType?: TradeType;
  propertyId?: string;
  agencyId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const transactionsApi = {
  // Get all transactions with pagination and filters
  getAll: async (params?: SearchTransactionsParams) => {
    const response = await api.get<PaginatedResponse<Transaction>>('/transactions', { params });
    return response.data;
  },

  // Get single transaction
  getOne: async (id: string) => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  create: async (data: CreateTransactionData) => {
    const response = await api.post<{ message: string; transaction: Transaction }>('/transactions', data);
    return response.data;
  },

  // Update transaction
  update: async (id: string, data: UpdateTransactionData) => {
    const response = await api.patch<{ message: string; transaction: Transaction }>(`/transactions/${id}`, data);
    return response.data;
  },

  // Delete transaction
  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/transactions/${id}`);
    return response.data;
  },

  // Verify transaction (Inspector)
  verify: async (id: string, data: VerifyTransactionData) => {
    const response = await api.post<{ message: string; verification: any }>(`/transactions/${id}/verify`, data);
    return response.data;
  },
};