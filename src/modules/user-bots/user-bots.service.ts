import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserBotsRepository } from './user-bots.repository';
import { CreateUserBotDto, UpdateUserBotDto } from './dtos/user-bots.dto';
import { UserBots } from './entities/user-bots.entity';
import {
  BotErrorMessages,
  UserBotsErrorMessages,
  UserErrorMessages,
} from 'src/entities/messages.entity';
import { BotRepository } from '../bot/bot.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class UserBotsService {
  constructor(
    private readonly userBotsRepository: UserBotsRepository,
    private readonly botRepo: BotRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async assignBotToUser(createUserBotDto: CreateUserBotDto): Promise<UserBots> {
    try {
      const { userId, botId } = createUserBotDto ?? {};
      const validUser = userId && (await this.userRepo.findUserById(userId));
      if (!validUser) throw new Error(UserErrorMessages.INVALID_USER_ID);

      const validBot = botId && (await this.botRepo.findBotById(botId));
      if (!validBot) throw new Error(BotErrorMessages.INVALID_BOT_ID);

      const existingAssignment = await this.userBotsRepository.findByUserAndBot(
        userId,
        botId,
      );

      if (existingAssignment) {
        throw new Error(UserBotsErrorMessages.USER_BOTS_ALREADY_EXISTS);
      }

      return await this.userBotsRepository.create(createUserBotDto);
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message || UserBotsErrorMessages.COULD_NOT_CREATED_USER_BOTS,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUserBot(
    id: string,
    updateUserBotDto: UpdateUserBotDto,
  ): Promise<UserBots> {
    try {
      const userBot = await this.userBotsRepository.findById(id);
      if (!userBot) {
        throw new Error(UserBotsErrorMessages.INVALID_USER_BOTS_ID);
      }

      return await this.userBotsRepository.update(id, updateUserBotDto);
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message || UserBotsErrorMessages.COULD_NOT_UPDATED_USER_BOTS,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserBots(userId: string): Promise<UserBots[]> {
    try {
      const validUser = userId && (await this.userRepo.findUserById(userId));
      if (!validUser) throw new Error(UserErrorMessages.INVALID_USER_ID);
      return await this.userBotsRepository.findUserBots(userId);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || UserErrorMessages.INVALID_USER_ID,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
