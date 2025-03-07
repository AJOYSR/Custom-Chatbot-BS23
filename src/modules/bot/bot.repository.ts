import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateBotDto, UpdateBotDto } from "./dto/bot.dto";
import { BotInterface } from "./entities/bot.entity";
import { BotModel } from "./entities/bot.model";

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

  async findById(id: string): Promise<BotInterface | null> {
    return BotModel.findById(id).lean();
  }

  async findAll(
    page: number,
    limit: number
  ): Promise<{ total: number; bots: BotInterface[] }> {
    const total = await BotModel.countDocuments();
    const bots = await BotModel.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return { total, bots };
  }

  async update(
    id: string,
    botData: UpdateBotDto
  ): Promise<BotInterface | null> {
    return BotModel.findByIdAndUpdate(id, botData, { new: true }).lean();
  }

  async delete(id: string): Promise<BotInterface | null> {
    return BotModel.findByIdAndDelete(id).lean();
  }
}
