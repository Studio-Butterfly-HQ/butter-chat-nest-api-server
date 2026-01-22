export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ErrorDetails;
  timestamp: string;
  path?: string;
}

export interface ErrorDetails {
  code: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}