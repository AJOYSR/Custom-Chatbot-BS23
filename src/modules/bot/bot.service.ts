import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateBotDto, UpdateBotDto } from "./dto/bot.dto";
import { BotRepository } from "./bot.repository";
import { BotInterface } from "./entities/bot.entity";
import { APIResponse } from "src/internal/api-response/api-response.service";

@Injectable()
export class BotService {
  constructor(
    private readonly botRepository: BotRepository,
    private readonly apiResponse: APIResponse
  ) {}

  async createBot(createBotDto: CreateBotDto): Promise<BotInterface> {
    return this.botRepository.create(createBotDto);
  }

  async getBotById(id: string): Promise<BotInterface> {
    const bot = await this.botRepository.findById(id);
    if (!bot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }
    return bot;
  }

  async getAllBots(
    page = 1,
    limit = 10
  ): Promise<{ total: number; bots: BotInterface[] }> {
    return this.botRepository.findAll(page, limit);
  }

  async updateBot(
    id: string,
    updateBotDto: UpdateBotDto
  ): Promise<BotInterface> {
    const updatedBot = await this.botRepository.update(id, updateBotDto);
    if (!updatedBot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }
    return updatedBot;
  }

  async deleteBot(id: string): Promise<void> {
    const deletedBot = await this.botRepository.delete(id);
    if (!deletedBot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }

    return this.apiResponse.success({ message: "Bot successfully deleted" });
  }
}
