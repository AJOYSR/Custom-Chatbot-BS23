import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
  Patch,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { BotService } from './bot.service';
import {
  BotResponseDto,
  CreateBotDto,
  GetAllBotQueryDto,
  GetBotListResponseDto,
  UpdateBotDto,
} from './dto/bot.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth-guard';
import { PermissionRequired } from 'src/decorators/permission.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { PERMISSIONS } from 'src/entities/enum.entity';
import { coreConfig } from 'src/config/core';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { User as UserInfo } from 'src/decorators/auth.decorator';
import { JwtPayload } from 'src/entities/auth.entity';

@ApiTags('Bots')
@Controller('bots')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  @PermissionRequired(PERMISSIONS.CREATE_BOT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Create a new bot' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
    ]),
  )
  async addNewBot(
    files: { logo?: Express.Multer.File[]; icon?: Express.Multer.File[] },
    @Body(new ValidationPipe({ whitelist: true }))
    data: CreateBotDto,
    @UserInfo() user: JwtPayload,
  ) {
    const logo = files?.logo?.[0];
    const icon = files?.icon?.[0];
    return await this.botService.createBot(data, user, logo, icon);
  }

  @Get(':botId')
  @PermissionRequired(PERMISSIONS.VIEW_BOT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get bot by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: BotResponseDto })
  async getBotById(@Param('botId') botId: string) {
    const bot = await this.botService.getBotById(botId);
    return bot;
  }

  @Get()
  @PermissionRequired(PERMISSIONS.VIEW_BOT_LIST)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all bots with pagination' })
  @ApiResponse({ status: HttpStatus.OK, type: GetBotListResponseDto })
  async getAllBots(@Query() query: GetAllBotQueryDto) {
    const { page = 1, limit = coreConfig.paginationLimit, ...rest } = query;
    return await this.botService.getAllBots(rest, {
      page,
      limit,
    });
  }

  @Patch(':botId')
  @PermissionRequired(PERMISSIONS.UPDATE_BOT)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update bot by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: BotResponseDto,
    description: 'Update the bot',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'icon', maxCount: 1 },
    ]),
  )
  async updateBot(
    @Param('botId') botId: string,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; icon?: Express.Multer.File[] },
    @Body(new ValidationPipe({ whitelist: true }))
    data: UpdateBotDto,
    @UserInfo() user: JwtPayload,
  ) {
    const logo = files?.logo?.[0];
    const icon = files?.icon?.[0];
    return await this.botService.updateBot(botId, data, user, logo, icon);
  }

  @Delete(':id')
  @PermissionRequired(PERMISSIONS.DELETE_BOT)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete bot by ID' })
  async deleteBot(@Param('id') id: string, @UserInfo() user: JwtPayload) {
    const res = await this.botService.deleteBot(id, user);
    return res;
  }
}
