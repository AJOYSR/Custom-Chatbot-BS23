import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ExcludeEmbeddingInterceptor implements NestInterceptor {
  private excludeEmbedding(data: any): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.excludeEmbedding(item));
    }

    if (data && typeof data === "object") {
      if (data.data) {
        // Handle paginated response
        return {
          ...data,
          data: this.excludeEmbedding(data.data),
        };
      }

      const { embedding, ...rest } = data;
      if (data.vectors) {
        // Handle batch responses
        return {
          ...rest,
          vectors: this.excludeEmbedding(data.vectors),
        };
      }
      return rest;
    }

    return data;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.excludeEmbedding(data)));
  }
}
