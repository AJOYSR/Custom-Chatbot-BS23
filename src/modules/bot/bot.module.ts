import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BotController } from './bot.controller';
import { BotSchema } from './entities/bot.model';
import { BotRepository } from './bot.repository';
import { BotService } from './bot.service';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { PaginationService } from '../pagination/pagination.service';
import { UserBotsRepository } from '../user-bots/user-bots.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bot', schema: BotSchema }])],
  controllers: [BotController],
  providers: [
    BotService,
    BotRepository,
    APIResponse,
    PaginationService,
    UserBotsRepository,
    UserRepository,
  ],
})
export class BotModule {}
