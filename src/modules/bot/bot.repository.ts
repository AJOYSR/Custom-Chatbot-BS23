import { Injectable } from '@nestjs/common';
import { CreateBotDto, UpdateBotDto } from './dto/bot.dto';
import { BotInterface } from './entities/bot.entity';
import { BotModel } from './entities/bot.model';

@Injectable()
export class BotRepository {
  async create(botData: CreateBotDto): Promise<BotInterface> {
    try {
      const bot = await BotModel.create(botData);
      return bot?.toObject();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findBotById(id: string): Promise<BotInterface | null> {
    try {
      const bot = await BotModel.findById(id).lean();
      return bot;
    } catch (error) {
      console.error('Error finding bot by ID:', error);
      return null;
    }
  }

  async findAllBots(
    query: Record<string, any>,
    pagination: { skip: number; limit: number },
  ): Promise<BotInterface[] | null> {
    try {
      return await BotModel.find(query)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async totalBoatCount(query: Record<string, any>): Promise<number> {
    try {
      return await BotModel.countDocuments(query).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  async update(
    id: string,
    botData: UpdateBotDto,
  ): Promise<BotInterface | null> {
    return BotModel.findByIdAndUpdate(id, botData, { new: true }).lean();
  }

  async deleteBotById(
    query: Record<string, any>,
    options?: { session?: any },
  ): Promise<Partial<BotInterface> | null> {
    try {
      return await BotModel.findOneAndDelete(query, options).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}
