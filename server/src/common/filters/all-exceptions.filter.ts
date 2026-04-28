import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ApiResponse } from "../dto/response.dto";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiResponse<null>;

    console.error("[Error]", {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception instanceof Error ? exception.message : String(exception),
    });

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST) {
        // Handle validation errors
        const validationError = exceptionResponse as any;
        const message = validationError.message || "Validation failed";
        const details = this.formatValidationErrors(validationError);

        console.error("[ValidationError]", {
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          message,
          details,
        });

        errorResponse = ApiResponse.error("VALIDATION_ERROR", message, details);
      } else if (status === HttpStatus.UNAUTHORIZED) {
        errorResponse = ApiResponse.error("UNAUTHORIZED", "Authentication required");
      } else if (status === HttpStatus.FORBIDDEN) {
        errorResponse = ApiResponse.error("FORBIDDEN", "Access denied");
      } else if (status === HttpStatus.NOT_FOUND) {
        errorResponse = ApiResponse.error("NOT_FOUND", "Resource not found");
      } else if (status === HttpStatus.CONFLICT) {
        errorResponse = ApiResponse.error("CONFLICT", "Resource already exists");
      } else {
        const message =
          exceptionResponse instanceof Object
            ? (exceptionResponse as any).message || "An error occurred"
            : String(exceptionResponse);

        errorResponse = ApiResponse.error(`HTTP_${status}`, message);
      }
    } else if (exception instanceof Error) {
      errorResponse = ApiResponse.error("INTERNAL_ERROR", exception.message);
    } else {
      errorResponse = ApiResponse.error("UNKNOWN_ERROR", "An unexpected error occurred");
    }

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(exceptionResponse: any): Record<string, any> {
    const details: Record<string, any> = {};

    if (Array.isArray(exceptionResponse.message)) {
      exceptionResponse.message.forEach((error: any) => {
        if (typeof error === "string") {
          details.general = error;
        } else if (error.property) {
          details[error.property] = error.constraints
            ? Object.values(error.constraints).join(", ")
            : error.message;
        }
      });
    } else if (exceptionResponse.message) {
      details.message = exceptionResponse.message;
    }

    return Object.keys(details).length > 0 ? details : {};
  }
}
