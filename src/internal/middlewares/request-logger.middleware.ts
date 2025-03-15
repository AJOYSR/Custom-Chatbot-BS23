import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { sanitizeRequestBodyWithXss } from 'src/helper/inputSanitize';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    req.body = sanitizeRequestBodyWithXss(req.body);
    next(); // Continue to the next middleware and route
  }
}
