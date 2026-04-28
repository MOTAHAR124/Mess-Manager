import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiResponse, PaginatedResponse } from "../dto/response.dto";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an ApiResponse, return as-is
        if (data instanceof ApiResponse) {
          return data;
        }

        // If data is a PaginatedResponse, wrap it
        if (data instanceof PaginatedResponse) {
          return ApiResponse.success(data);
        }

        // Otherwise, wrap the data in ApiResponse
        return ApiResponse.success(data);
      }),
    );
  }
}
