import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserBotDto {
  @IsString({
    message: 'validation.isString',
  })
  @IsNotEmpty({
    message: 'validation.isNotEmpty',
  })
  userId: string;

  @IsString({
    message: 'validation.isString',
  })
  @IsNotEmpty({
    message: 'validation.isNotEmpty',
  })
  botId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateUserBotDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
