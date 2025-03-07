import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BotService } from "./bot.service";
import {
  BotResponseDto,
  CreateBotDto,
  GetBotListResponseDto,
  UpdateBotDto,
} from "./dto/bot.dto";

@ApiTags("Bots")
@Controller("bots")
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  @ApiOperation({ summary: "Create a new bot" })
  @ApiResponse({ status: HttpStatus.CREATED, type: BotResponseDto })
  async createBot(@Body() createBotDto: CreateBotDto) {
    const bot = await this.botService.createBot(createBotDto);
    return { data: bot };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get bot by ID" })
  @ApiResponse({ status: HttpStatus.OK, type: BotResponseDto })
  async getBotById(@Param("id") id: string) {
    const bot = await this.botService.getBotById(id);
    return { data: bot };
  }

  @Get()
  @ApiOperation({ summary: "Get all bots with pagination" })
  @ApiResponse({ status: HttpStatus.OK, type: GetBotListResponseDto })
  async getAllBots(@Query("page") page = 1, @Query("limit") limit = 10) {
    const { total, bots } = await this.botService.getAllBots(
      Number(page),
      Number(limit)
    );
    return { total, page, limit, data: bots };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update bot by ID" })
  @ApiResponse({ status: HttpStatus.OK, type: BotResponseDto })
  async updateBot(@Param("id") id: string, @Body() updateBotDto: UpdateBotDto) {
    const bot = await this.botService.updateBot(id, updateBotDto);
    return { data: bot };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete bot by ID" })
  async deleteBot(@Param("id") id: string) {
    const res = await this.botService.deleteBot(id);
    return res;
  }
}
