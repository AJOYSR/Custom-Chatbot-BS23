// conversation.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  ValidateNested,
  IsEnum,
  IsDate,
  IsObject,
} from 'class-validator';
import {
  ConversationInterface,
  CreateConversationInterface,
} from '../entities/conversation.entity';
import { Message } from 'src/entities/message.entity';
import { QUERY_USER_TYPE } from 'src/entities/enum.entity';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from 'src/modules/pagination/types';
export class MessageDto implements Message {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: QUERY_USER_TYPE,
    example: QUERY_USER_TYPE.USER,
  })
  @IsEnum(QUERY_USER_TYPE, { message: 'validation.isEnum' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  role: QUERY_USER_TYPE;

  @ApiProperty({
    description: 'Content of the message',
    example: 'Hello, how can I help you today?',
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  content: string;

  @ApiProperty({
    description: 'Timestamp when the message was sent',
    example: new Date(),
  })
  @IsDate({ message: 'validation.isDate' })
  @Type(() => Date)
  @IsNotEmpty({ message: 'validation.notEmpty' })
  timestamp: Date;
}
export class ConversationDto implements Partial<ConversationInterface> {
  @ApiProperty({
    description: 'Unique identifier for the conversation',
  })
  _id?: string;

  @ApiProperty({ description: 'The botId associated with the conversation' })
  botId: string;

  @ApiProperty({
    description: 'The userId associated with the conversation',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Array of messages associated with the conversation',
  })
  messages: Message[];

  @ApiProperty({
    description: 'The timestamp when the conversation was created',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'The timestamp when the conversation was last updated',
    required: false,
  })
  updatedAt?: Date;
}

export class CreateConversationDto
  implements Partial<CreateConversationInterface>
{
  @ApiProperty({
    description: 'The botId associated with the conversation',
    required: true,
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  botId: string;

  @ApiProperty({
    description: 'The userId associated with the conversation',
    required: false,
  })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: 'Array of messages associated with the conversation',
    type: MessageDto,
    required: true,
  })
  @IsObject({ message: 'validation.isObject' })
  @ValidateNested()
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @Type(() => MessageDto)
  message: Message;

  @ApiPropertyOptional({
    description: 'Conversation ID',
    required: false,
  })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  conversationId?: string;
}

export class ConversationResponseDto {
  @ApiProperty({ type: ConversationDto })
  data: ConversationDto;
}

export class GetConversationListResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [ConversationDto] })
  data: ConversationDto[];
}

export class GetAllConversationQueryDto extends PaginationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'validation.isString' })
  q: string;
}

export class UpdateConversationDto
  implements Partial<CreateConversationInterface>
{
  @ApiProperty({
    description: 'Array of messages associated with the conversation',
    type: MessageDto,
    required: true,
  })
  @IsObject({ message: 'validation.isObject' })
  @ValidateNested({
    message: 'validation.isNested',
  })
  @IsNotEmpty({ message: 'validation.notEmpty' })
  @Type(() => MessageDto)
  message: Message;
}
