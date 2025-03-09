/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Type, BadRequestException } from '@nestjs/common';
import {
  validate,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
  validateSync,
} from 'class-validator';
import { plainToClass } from 'class-transformer';

// Define interfaces and types used in the code
export interface PipeTransform<T = any, R = any> {
  transform(value: T, metadata: ArgumentMetadata): R;
}
export interface ArgumentMetadata {
  metatype?: Type<any> | undefined;
}
export declare class ValidationError {
  property: string;
  constraints?: {
    [type: string]: string;
  };
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Converts plain (literal) object to class (constructor) object.
    const object = value && plainToClass(metatype, value);
    const errors: ValidationError[] =
      object &&
      (await validate(object, {
        validationError: {
          target: false,
          value: false,
        },
        forbidUnknownValues: false,
      }));

    const errorsResponse: any = {
      statusCode: 400,
      message: '',
    };

    if (errors && errors.length > 0) {
      errorsResponse.message = {};

      errors?.forEach((err: any) => {
        if (err?.children?.length) {
          err.children.forEach((errChildren: any) => {
            // Handle nested validation errors
            // Get the first error message
            errorsResponse.message[errChildren.property] = Object.values(
              errChildren?.constraints,
            )[0];
          });
        } else {
          // Get the first error message
          // Handle top-level validation errors
          errorsResponse.message[err.property] = Object.values(
            err?.constraints,
          )[0];
        }
      });

      // Throw a BadRequestException with the formatted error response
      throw new BadRequestException(errorsResponse);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

/**
 * @decorator
 * @description A custom decorator to validate a validation-schema within a validation schema upload N levels
 * @param schema The validation Class
 */
export function ValidateNested(
  schema: new () => any,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'ValidateNested',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        // Custom validator for nested validation
        validate(value: any, args: ValidationArguments) {
          args.value;
          if (Array.isArray(value)) {
            // Validate each element in the array
            for (let i = 0; i < value.length; i++) {
              if (
                value &&
                schema &&
                value[i] &&
                validateSync(plainToClass(schema, value[i])).length
              ) {
                return false;
              }
            }
            return true;
          } else {
            // Validate the single nested object
            if (
              value &&
              schema &&
              validateSync(plainToClass(schema, value))?.length
            ) {
              return false;
            } else return true;
          }
        },
        defaultMessage(args) {
          // Custom error message for nested validation
          if (Array.isArray(args.value)) {
            for (let i = 0; i < args.value.length; i++) {
              return (
                args.value &&
                args.value[i] &&
                validateSync(plainToClass(schema, args.value[i]))
                  .map((e) => e.constraints)
                  .reduce((acc, next) => acc.concat(Object.values(next)), [])
              ).toString();
            }
          } else {
            return (
              args.value &&
              validateSync(plainToClass(schema, args.value))
                .map((e) => e.constraints)
                .reduce((acc, next) => acc.concat(Object.values(next)), [])
            ).toString();
          }
        },
      },
    });
  };
}
