import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDate,
  IsArray,
  MinLength,
  Matches,
  IsEnum,
} from "class-validator";
import { BotInterface } from "./../entities/bot.entity";
import { BOT_STATUS } from "src/common/entities/enum.entity";

export class BotDto {
  @ApiProperty({ description: "Unique identifier for the bot" })
  _id: string;

  @ApiProperty({ description: "The name of the bot" })
  name: string;

  @ApiProperty({ description: "The color of the bot" })
  color: string;

  @ApiProperty({ description: "The description of the bot", required: false })
  description?: string;

  @ApiProperty({ description: "URL or path to the bot icon", required: false })
  icon?: string;

  @ApiProperty({ description: "URL or path to the bot logo", required: false })
  logo?: string;

  @ApiProperty({ description: "The status of the bot" })
  status: string;

  @ApiProperty({
    description: "Welcome message displayed by the bot",
    required: false,
  })
  welcomeMessage?: string;

  @ApiProperty({
    description: "Fallback message when the bot cannot respond",
    required: false,
  })
  fallbackMessage?: string;

  @ApiProperty({
    description: "Message suggesting alternative actions",
    required: false,
  })
  suggestionMessage?: string;

  @ApiProperty({
    description: "Whether to hand over to a human agent",
    required: false,
  })
  handoverToHuman?: boolean;

  @ApiProperty({ description: "System prompt for the bot", required: false })
  systemPrompt?: string;

  @ApiProperty({ description: "Date when the bot was created" })
  createdAt: Date;

  @ApiProperty({ description: "Date when the bot was last updated" })
  updatedAt: Date;
}

// Create Bot DTO
export class CreateBotDto implements Partial<BotInterface> {
  @ApiProperty({
    description: "The name of the bot",
    example: "Customer Support Bot",
  })
  @IsString({ message: "Name must be a string" })
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  name: string;

  @ApiProperty({
    description: "The color for the bot (hex code or color name)",
    example: "#FF5733",
  })
  @IsString({ message: "Color must be a string" })
  @IsNotEmpty({ message: "Color is required" })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/, {
    message: "Color must be a valid hex code (e.g., #FF5733) or color name",
  })
  color: string;

  @ApiProperty({
    description: "The description of the bot",
    example: "A bot that helps with customer support queries",
  })
  @IsString({ message: "Description must be a string" })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "URL or path to the bot icon",
    example: "https://example.com/icon.png",
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: "URL or path to the bot logo",
    example: "https://example.com/logo.png",
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: "The system prompt for the bot",
    example: "You are a helpful customer support assistant.",
  })
  @IsString({ message: "System prompt must be a string" })
  systemPrompt: string;

  @ApiProperty({
    description: "The status of the bot (active or inactive)",
    example: "active",
    enum: BOT_STATUS,
  })
  @IsEnum(BOT_STATUS, {
    message: "Status must be either 'active' or 'inactive'",
  })
  @IsNotEmpty({ message: "Status is required" })
  status: BOT_STATUS;

  @ApiPropertyOptional({
    description: "Welcome message displayed by the bot",
    example: "Hello! How can I assist you today?",
  })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiPropertyOptional({
    description: "Fallback message when the bot cannot respond",
    example: "Sorry, I don’t understand that. Can you try again?",
  })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiPropertyOptional({
    description: "Message suggesting alternative actions",
    example: "Try asking something else!",
  })
  @IsOptional()
  @IsString()
  suggestionMessage?: string;

  @ApiPropertyOptional({
    description: "Whether to hand over to a human agent",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  handoverToHuman?: boolean;
}

// Update Bot DTO
export class UpdateBotDto implements Partial<BotInterface> {
  @ApiPropertyOptional({
    description: "The name of the bot",
    example: "Customer Support Bot",
  })
  @IsString({ message: "Name must be a string" })
  @MinLength(3, { message: "Name must be at least 3 characters long" })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "The color for the bot (hex code or color name)",
    example: "#FF5733",
  })
  @IsString({ message: "Color must be a string" })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$|^[a-zA-Z]+$/, {
    message: "Color must be a valid hex code (e.g., #FF5733) or color name",
  })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({
    description: "The description of the bot",
    example: "A bot that helps with customer support queries",
  })
  @IsString({ message: "Description must be a string" })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "URL or path to the bot icon",
    example: "https://example.com/icon.png",
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: "URL or path to the bot logo",
    example: "https://example.com/logo.png",
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    description: "The system prompt for the bot",
    example: "You are a helpful customer support assistant.",
  })
  @IsString({ message: "System prompt must be a string" })
  @IsOptional()
  systemPrompt?: string;

  @ApiPropertyOptional({
    description: "The status of the bot (active or inactive)",
    example: "active",
    enum: BOT_STATUS,
  })
  @IsEnum(BOT_STATUS, {
    message: "Status must be either 'active' or 'inactive'",
  })
  @IsOptional()
  status?: BOT_STATUS;

  @ApiPropertyOptional({
    description: "Welcome message displayed by the bot",
    example: "Hello! How can I assist you today?",
  })
  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @ApiPropertyOptional({
    description: "Fallback message when the bot cannot respond",
    example: "Sorry, I don’t understand that. Can you try again?",
  })
  @IsOptional()
  @IsString()
  fallbackMessage?: string;

  @ApiPropertyOptional({
    description: "Message suggesting alternative actions",
    example: "Try asking something else!",
  })
  @IsOptional()
  @IsString()
  suggestionMessage?: string;

  @ApiPropertyOptional({
    description: "Whether to hand over to a human agent",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  handoverToHuman?: boolean;
}
//Single
export class BotResponseDto {
  @ApiProperty({ type: BotDto })
  data: BotInterface;
}

export class GetBotListResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty({ type: [BotDto] })
  data: BotDto[];
}
