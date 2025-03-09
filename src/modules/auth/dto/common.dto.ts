import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}

export class TokenResponseDto {
  @ApiProperty()
  token: string;
}
