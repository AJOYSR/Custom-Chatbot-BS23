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

@Injectable()
export class BotService {
  constructor(
    private readonly botRepository: BotRepository,
    private readonly apiResponse: APIResponse,
    private readonly pagination: PaginationService,
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
    console.log('🚀 ~ BotService ~ getBotById ~ botId:', botId);
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
    const bot = await this.botRepository.findBotById(botId);
    if (!bot)
      throw new HttpException(
        { message: BotErrorMessages.INVALID_BOT_ID },
        HttpStatus.BAD_REQUEST,
      );

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
