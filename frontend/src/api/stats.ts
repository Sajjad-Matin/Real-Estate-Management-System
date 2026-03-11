import api from "../services/api-client";

export interface DashboardStats {
  totalProperties: number;
  totalAgencies: number;
  activeAgencies: number;
  bannedAgencies: number;
  pendingVerifications: number;
  totalInspectors: number;
  totalTransactions: number;
  pendingTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
}

export interface TransactionTrend {
  date: string;
  count: number;
  type?: string;
}

export interface TradeTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

export const statsApi = {
  // Get dashboard stats for SUPER_ADMIN
  getSuperAdminStats: async () => {
    const response = await api.get<DashboardStats>('/stats/super-admin');
    return response.data;
  },

  // Get dashboard stats for AGENCY_ADMIN
  getAgencyAdminStats: async () => {
    const response = await api.get<DashboardStats>('/stats/agency-admin');
    return response.data;
  },

  // Get dashboard stats for INSPECTOR
  getInspectorStats: async () => {
    const response = await api.get<DashboardStats>('/stats/inspector');
    return response.data;
  },

  // Get transaction trends (last 30 days)
  getTransactionTrends: async (days: number = 30) => {
    const response = await api.get<TransactionTrend[]>('/stats/transaction-trends', {
      params: { days },
    });
    return response.data;
  },

  // Get trade type distribution
  getTradeTypeDistribution: async () => {
    const response = await api.get<TradeTypeDistribution[]>('/stats/trade-distribution');
    return response.data;
  },
};