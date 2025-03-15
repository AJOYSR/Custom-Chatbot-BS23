import { QnaInterface } from './../../../entities/qna.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';

export class QnaDto implements QnaInterface {
  @ApiProperty()
  id: string;
  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  botId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
  @ApiProperty({ required: false })
  cosine_similarity?: string;

  @ApiProperty({ required: false })
  cosine_score?: string;

  @ApiProperty({ required: false })
  hybrid_score?: string;

  @ApiProperty({ required: false })
  combined_score?: string;
}

export class UpdateVectorDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  answer?: string;
}

export class SearchVectorByQuestionDto {
  @ApiProperty({ required: true })
  @IsString()
  question: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  botId?: string;

  @ApiProperty({ required: false, default: 5 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class SearchVectorDto {
  @ApiProperty({
    description: 'The vector embedding to search with',
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  embedding: number[];

  @ApiProperty({
    description: 'The maximum number of results to return',
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class CreateVectorDto {
  @ApiProperty({ description: 'The question text' })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({ description: 'The answer text' })
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty({ description: 'The company ID' })
  @IsNotEmpty()
  @IsString()
  botId: string;
}

export class CreateVectorBatchDto {
  @ApiProperty({
    type: [CreateVectorDto],
    description: 'Array of vectors to create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateVectorDto)
  vectors: CreateVectorDto[];
}

export class QnaListResponseDto {
  data: QnaDto[];
}
