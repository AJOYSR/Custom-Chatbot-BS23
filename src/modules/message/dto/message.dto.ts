import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum, IsDate } from "class-validator";
import { SENDER_TYPE } from "src/common/entities/enum.entity";
import { MessageInterface } from "../entities/message.entity";

export class MessageDto {
  @ApiProperty({ description: "Unique identifier for the message" })
  _id: string;

  @ApiProperty({ description: "The sender type of the message" })
  sender: string;

  @ApiProperty({ description: "The content of the message" })
  content: string;
}

// Create Message DTO
export class CreateMessageDto implements Partial<MessageInterface> {
  @ApiProperty({
    description: "The sender type of the message",
    example: "user",
  })
  @IsEnum(SENDER_TYPE, {
    message: "Sender must be a valid sender type",
  })
  sender: SENDER_TYPE;

  @ApiProperty({
    description: "The content of the message",
    example: "Hello! How can I help you?",
  })
  @IsString({ message: "Content must be a string" })
  @IsNotEmpty({ message: "Content is required" })
  content: string;
}

// Single Message Response DTO
export class MessageResponseDto {
  @ApiProperty({ type: MessageDto })
  data: MessageDto;
}

// List of Messages Response DTO
export class GetMessageListResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [MessageDto] })
  data: MessageDto[];
}
