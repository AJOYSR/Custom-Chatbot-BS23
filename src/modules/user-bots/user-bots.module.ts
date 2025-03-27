import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserBotsService } from './user-bots.service';
import { UserBotsRepository } from './user-bots.repository';
import { UserBotsSchema } from './entities/user-bots.model';
import { BotRepository } from '../bot/bot.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'UserBots', schema: UserBotsSchema }]),
  ],
  providers: [
    UserBotsService,
    UserBotsRepository,
    BotRepository,
    UserRepository,
  ],
  exports: [UserBotsService],
})
export class UserBotsModule {}
