import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotInterface } from "./entities/bot.entity";
import { ApiTags } from "@nestjs/swagger";
@ApiTags("Bots API List")
@Controller("bots")
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  async create(@Body() botData: Partial<BotInterface>): Promise<BotInterface> {
    return this.botService.create(botData);
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<BotInterface> {
    const bot = await this.botService.findById(id);
    if (!bot) {
      throw new NotFoundException("BotInterface not found");
    }
    return bot;
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() botData: Partial<BotInterface>
  ): Promise<BotInterface> {
    const bot = await this.botService.update(id, botData);
    if (!bot) {
      throw new NotFoundException("BotInterface not found");
    }
    return bot;
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    const bot = await this.botService.delete(id);
    if (!bot) {
      throw new NotFoundException("BotInterface not found");
    }
  }
}
