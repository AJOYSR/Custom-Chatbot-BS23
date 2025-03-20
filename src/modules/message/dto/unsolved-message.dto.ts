import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { UNPROCESSED_MESSAGE_STATUS } from 'src/entities/enum.entity';
import { UnresolvedQueryInterface } from '../entities/unresolved-message.entity';
import { PaginationQueryDto } from 'src/modules/pagination/types';

// Base DTO
export class UnresolvedQueryDto implements UnresolvedQueryInterface {
  @ApiProperty({ description: 'Unique identifier for the unresolved query' })
  _id?: string;

  @ApiProperty({ description: 'The bot ID associated with this query' })
  botId: string;

  @ApiProperty({
    description: 'The conversation ID associated with this query',
  })
  conversationId: string;

  @ApiProperty({ description: 'The unresolved user query' })
  query: string;

  @ApiProperty({
    description: 'The status of the unresolved query',
    enum: UNPROCESSED_MESSAGE_STATUS,
  })
  status: UNPROCESSED_MESSAGE_STATUS;
}

// Create Unresolved Query DTO
export class CreateUnresolvedQueryDto
  implements Partial<UnresolvedQueryInterface>
{
  @ApiProperty({
    description: 'The bot ID associated with this query',
    example: '65f2b1e0a67c2a4f2c8b7e89',
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  botId: any;

  @ApiProperty({
    description: 'The conversation ID associated with this query',
    example: '65f2b1e0a67c2a4f2c8b7e99',
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  conversationId: any;

  @ApiProperty({
    description: 'The unresolved user query',
    example: 'Why is my payment not processed?',
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  query: string;

  @ApiProperty({
    description: 'The status of the unresolved query',
    example: UNPROCESSED_MESSAGE_STATUS.PENDING,
    enum: UNPROCESSED_MESSAGE_STATUS,
  })
  @IsEnum(UNPROCESSED_MESSAGE_STATUS, {
    message: 'validation.isEnum',
  })
  status?: UNPROCESSED_MESSAGE_STATUS;
}

// Single Unresolved Query Response DTO
export class UnresolvedQueryResponseDto {
  @ApiProperty({ type: UnresolvedQueryDto })
  data: UnresolvedQueryDto;
}

// List of Unresolved Queries Response DTO
export class GetUnresolvedQueryListResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [UnresolvedQueryDto] })
  data: UnresolvedQueryDto[];
}

export class GetAllUnsolvedQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  q: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  botId?: string;
}

export class UpdateUnresolvedQueryDto
  implements Partial<UnresolvedQueryInterface>
{
  @ApiProperty({
    description: 'The status of the unresolved query',
    example: UNPROCESSED_MESSAGE_STATUS.RESOLVED,
    enum: UNPROCESSED_MESSAGE_STATUS,
    required: true,
  })
  @IsEnum(UNPROCESSED_MESSAGE_STATUS, {
    message: 'validation.isEnum',
  })
  @IsOptional()
  status: UNPROCESSED_MESSAGE_STATUS;
}
