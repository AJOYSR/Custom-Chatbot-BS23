/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';
import { BotRepository } from './bot.repository';
import { BotInterface } from './entities/bot.entity';
import {
  APIResponse,
  IResponse,
} from 'src/internal/api-response/api-response.service';
import { PaginationQuery } from 'src/entities/common.entity';
import { generateSearchQuery } from 'src/helper/utils';
import { PaginationService } from '../pagination/pagination.service';
import { JwtPayload } from 'src/entities/auth.entity';
import {
  AuthErrorMessages,
  BotErrorMessages,
  UserErrorMessages,
} from 'src/entities/messages.entity';
import { ROLE } from 'src/entities/enum.entity';
import { startSession } from 'mongoose';
import { UserBotsRepository } from '../user-bots/user-bots.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class BotService {
  constructor(
    private readonly botRepository: BotRepository,
    private readonly apiResponse: APIResponse,
    private readonly pagination: PaginationService,
    private readonly userBotsRepo: UserBotsRepository,
    private readonly userRepo: UserRepository,
  ) {}

  async createBot(
    createBotDto: CreateBotDto,
    user: JwtPayload,
    logo: Express.Multer.File,
    icon?: Express.Multer.File,
  ): Promise<IResponse<BotInterface>> {
    return this.botRepository.create(createBotDto);
  }

  async getBotById(botId: string): Promise<BotInterface> {
    const bot = await this.botRepository.findBotById(botId);
    if (!bot)
      throw new HttpException(
        { message: BotErrorMessages.INVALID_BOT_ID },
        HttpStatus.BAD_REQUEST,
      );

    return this.apiResponse.success(bot);
  }

  async getAllBots(
    condition: { q: string },
    pagination: PaginationQuery,
  ): Promise<{ total: number; bots: BotInterface[] }> {
    const query = generateSearchQuery(condition);
    const { data, page, limit, total } = await this.pagination.paginate(
      this.botRepository.findAllBots.bind(this.botRepository),
      this.botRepository.totalBoatCount.bind(this.botRepository),
      query,
      pagination,
    );

    return this.apiResponse.success(data, { page, limit, total });
  }

  async updateBot(
    botId: string,
    data: UpdateBotDto,
    user: JwtPayload,
    logo?: Express.Multer.File,
    icon?: Express.Multer.File,
  ): Promise<IResponse<BotInterface>> {
    // Check if the bot exists
    const [creatorRole, bot] = await Promise.all([
      await this.userRepo.findRole({ _id: user?.roleId?._id }),
      await this.botRepository.findBotById(botId),
    ]);
    console.log('🚀 ~ BotService ~ creatorRole:', creatorRole);

    if (!bot)
      throw new HttpException(
        { message: BotErrorMessages.INVALID_BOT_ID },
        HttpStatus.BAD_REQUEST,
      );

    const isOwner = await this.userBotsRepo.findByUserAndBot(user._id, botId);

    // Check if the creatorRole is CUSTOMER or if the user is not the owner
    if (!isOwner && creatorRole.name !== ROLE.SUPER_ADMIN) {
      throw new HttpException(
        { message: UserErrorMessages.FORBIDDEN_PERMISSION },
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedBot = await this.botRepository.update(botId, data);

    if (!updatedBot) {
      throw new HttpException(
        { message: BotErrorMessages.COULD_NOT_UPDATE_BOT },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.apiResponse.success(updatedBot);
  }

  async deleteBot(id: string, user: JwtPayload): Promise<void> {
    // Start a session to perform a transaction
    const session = await startSession();
    session.startTransaction();
    try {
      const validBot = await this.botRepository.findBotById(id);
      // If the bot is not valid
      if (!validBot) {
        throw new Error(BotErrorMessages.INVALID_BOT_ID);
      }

      const deletedBot = await this.botRepository.deleteBotById(
        { _id: id },
        { session },
      );

      if (!deletedBot) {
        throw new HttpException(
          { message: BotErrorMessages.COULD_NOT_DELETE_BOT },
          HttpStatus.BAD_REQUEST,
        );
      }
      // Commit the transaction if all operations succeed
      await session.commitTransaction();

      session.endSession();

      return this.apiResponse.success({
        message: 'Bot has been deleted successfully',
      });
    } catch (error) {
      console.log('🚀 ~ BotService ~ deleteBot ~ error:', error);
      throw new HttpException(
        {
          message: error.message || BotErrorMessages.COULD_NOT_DELETE_BOT,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
