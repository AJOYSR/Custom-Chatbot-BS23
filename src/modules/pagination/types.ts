import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber } from 'class-validator';
import { PaginationInterface } from 'src/interface/common';

export class PaginationQueryDto implements PaginationInterface {
  @ApiProperty({ required: false, type: Number, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'validation.isNumber' })
  page: number;

  @ApiProperty({ required: false, type: Number, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'validation.isNumber' })
  limit: number;
}

export type GetDataFunction<T> = (query: any, options: any) => Promise<T[]>;
export type GetCountFunction = (query: any) => Promise<number>;
