export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  INSPECTOR = 'INSPECTOR',
}

export enum AgencyStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  BANNED = 'BANNED',
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum TradeType {
  SALE = 'SALE',
  RENT = 'RENT',
  TRANSFER = 'TRANSFER',
}

export enum Language {
  EN = 'EN',
  FA = 'FA',
  PS = 'PS',
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  language: Language;
  isActive: boolean;
  agencyId?: string | null;
  agency?: Agency | null;
  createdAt: string;
  updatedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  region: string;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    properties: number;
    tradeTransactions: number;
  };
}

export interface Property {
  id: string;
  title: string;
  address: string;
  region: string;
  cadastralNo?: string;
  agencyId: string;
  agency?: Agency;
  createdAt: string;
  updatedAt: string;
  _count?: {
    ownerships: number;
    trades: number;
  };
}

export interface Transaction {
  id: string;
  propertyId: string;
  property?: Property;
  agencyId: string;
  agency?: Agency;
  tradeType: TradeType;
  price: number;
  buyerName: string;
  buyerIdNo?: string;
  sellerName: string;
  sellerIdNo?: string;
  status: VerificationStatus;
  verifications?: Verification[];
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  tradeId: string;
  verifiedBy: string;
  status: VerificationStatus;
  remarks?: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}