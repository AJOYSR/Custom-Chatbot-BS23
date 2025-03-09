// conversation.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsNotEmpty } from "class-validator";
import { ConversationInterface } from "../entities/conversation.entity";
import { Message } from "src/entities/message.entity";

export class ConversationDto implements Partial<ConversationInterface> {
  @ApiProperty({
    description: "Unique identifier for the conversation",
  })
  _id?: string;

  @ApiProperty({ description: "The botId associated with the conversation" })
  botId: string;

  @ApiProperty({
    description: "The userId associated with the conversation",
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: "Array of messages associated with the conversation",
  })
  messages: Message[];

  @ApiProperty({
    description: "The timestamp when the conversation was created",
  })
  createdAt?: Date;

  @ApiProperty({
    description: "The timestamp when the conversation was last updated",
    required: false,
  })
  updatedAt?: Date;
}

export class CreateConversationDto implements Partial<ConversationInterface> {
  @ApiProperty({ description: "The botId associated with the conversation" })
  @IsString({ message: "botId must be a string" })
  @IsNotEmpty({ message: "botId is required" })
  botId: string;

  @ApiProperty({
    description: "The userId associated with the conversation",
    required: false,
  })
  @IsString({ message: "userId must be a string" })
  @IsOptional()
  userId?: string;

  @ApiProperty({
    description: "Array of messages associated with the conversation",
  })
  @IsArray({ message: "Messages must be an array" })
  @IsNotEmpty({ message: "Messages are required" })
  messages: Message[];
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
