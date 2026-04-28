// Unified API Response DTO

/**
 * Global Unified API Response Format
 * Strictly follows the project standard defined in user rules.
 */
export class ApiResponse<T> {
  success: boolean;

  message: string;

  data?: T;

  error?: {
    code: string; // Machine-readable error code (e.g., "INVALID_INPUT")
    message?: string; // Human-readable error message
    details?: unknown; // Additional context (validation errors, etc.)
    traceId?: string; // For distributed tracing
  };

  metadata?: {
    timestamp: string; // ISO 8601 timestamp
    requestId?: string; // For request tracking
    pagination?: {
      // For paginated responses
      page: number;
      pageSize: number;
      total: number;
      hasMore: boolean;
      cursor?: string | null;
    };
  };

  constructor(
    success: boolean,
    message: string,
    data?: T,
    error?: ApiResponse<T>["error"],
    metadata?: ApiResponse<T>["metadata"],
  ) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
    this.metadata = metadata || {
      timestamp: new Date().toISOString(),
    };
  }

  static success<T>(
    data: T,
    message = "Success",
    metadata?: ApiResponse<T>["metadata"],
  ): ApiResponse<T> {
    return new ApiResponse(true, message, data, undefined, metadata);
  }

  static error<T>(
    code: string,
    message: string,
    details?: unknown,
    traceId?: string,
  ): ApiResponse<T> {
    return new ApiResponse(false, message, undefined, {
      code,
      message,
      details,
      traceId,
    }) as ApiResponse<T>;
  }
}

/**
 * Paginated Response Helper
 */
export class PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  cursor?: string | null;

  constructor(
    data: T[],
    total: number,
    page: number = 1,
    pageSize: number = 20,
    hasMore: boolean = false,
    cursor: string | null = null,
  ) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.hasMore = hasMore;
    this.cursor = cursor;
  }
}

/**
 * Interface for field-specific validation errors
 */
export class FieldError {
  field: string;
  message: string;

  constructor(field: string, message: string) {
    this.field = field;
    this.message = message;
  }
}

/**
 * Standard Error Response DTO
 */
export class ApiErrorDto {
  code: string;
  message: string;
  details?: any;

  constructor(code: string, message: string, details?: any) {
    this.code = code;
    this.message = message;
    this.details = details;
  }
}
