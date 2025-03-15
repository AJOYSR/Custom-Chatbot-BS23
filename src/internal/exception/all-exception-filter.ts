import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CommonErrorMessages } from 'src/entities/messages.entity';

// Define an interface to represent the structure of the exception object
export interface IException {
  response: Record<string, any>;
  status: number;
  statusCode: number;
  name: string;
  message: string;
  stack: string;
}

// Create a custom exception filter using the @Catch() decorator
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  // Implement the catch method required by the ExceptionFilter interface
  async catch(exception: IException, host: ArgumentsHost): Promise<any> {
    // Extract the HTTP context from the host
    const ctx = host.switchToHttp();
    // Get the response object from the HTTP context
    const res: Response = ctx.getResponse<Response>();

    // Log the exception to the console if the response property is missing
    if (!exception?.response?.message) {
      console.error(exception);
    }

    // Determine the error message
    const message =
      exception?.response?.message || CommonErrorMessages.SOMETHING_WENT_WRONG;

    // Translate the error message if it's a string
    const translate =
      typeof message === 'string' &&
      this.i18n.translate(message, {
        lang: I18nContext.current()?.lang,
      });

    // Translate each error message in case it's an object
    typeof exception?.response?.message === 'object' &&
      Object.keys(exception?.response?.message).forEach((key) => {
        if (key) {
          const translatedMessage = this.i18n.translate(
            exception?.response?.message[key],
            {
              lang: I18nContext.current().lang,
              args: { property: key },
            },
          );
          message[key] = translatedMessage;
        }
      });
    // Create the error object
    const errorObj = {
      statusCode: exception?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      message: translate || message, // Use translated message if available, otherwise use original message
    };

    // Set the HTTP status code and send the error object as JSON response
    res
      .status(exception?.status || HttpStatus.INTERNAL_SERVER_ERROR)
      .json(errorObj);
  }
}
