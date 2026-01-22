import { ApiResponse, PaginatedResponse, PaginationMeta } from "../interface/api-response.interface";

export class ResponseUtil {
  /**
   * Success response
   */
  static success<T>(
    message: string = 'Operation successful',
    data?: T,
    path?: string
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Error response
   */
  static error(
    message: string = 'Operation failed',
    code: string = 'ERROR',
    details?: any,
    path?: string
  ): ApiResponse {
    return {
      success: false,
      message,
      error: {
        code,
        details,
      },
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    message: string = 'Data retrieved successfully',
    data: T[],
    pagination: PaginationMeta
  ): PaginatedResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Created response (201)
   */
  static created<T>(
    message: string = 'Resource created successfully',
    data?: T,
    path?: string
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * No content response (204)
   */
  static noContent(
    message: string = 'Operation completed successfully'
  ): ApiResponse {
    return {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}