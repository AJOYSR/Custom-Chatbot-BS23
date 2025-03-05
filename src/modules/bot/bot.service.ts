import { Injectable } from "@nestjs/common";
import { BotRepository } from "./bot.repository";
import { BotInterface } from "./entities/bot.entity";

@Injectable()
export class BotService {
  constructor(private readonly botRepository: BotRepository) {}

  async create(botData: Partial<BotInterface>): Promise<BotInterface> {
    return this.botRepository.create(botData);
  }

  async findById(id: string): Promise<BotInterface | null> {
    return this.botRepository.findById(id);
  }

  async update(
    id: string,
    botData: Partial<BotInterface>
  ): Promise<BotInterface | null> {
    return this.botRepository.update(id, botData);
  }

  async delete(id: string): Promise<BotInterface | null> {
    return this.botRepository.delete(id);
  }
}
