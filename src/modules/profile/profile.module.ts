import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UserModule } from 'src/modules/user/user.module';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { UserBotsRepository } from '../user-bots/user-bots.repository';

@Module({
  imports: [UserModule],
  controllers: [ProfileController],
  providers: [ProfileService, APIResponse, UserBotsRepository],
})
export class ProfileModule {}
