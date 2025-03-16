import { Module } from '@nestjs/common';
import { QnAController } from './qna.controller';
import { QnAService } from './qna.service';
import { AIResponseService } from 'src/modules/ai-response/ai-response.service';
import { PaginationService } from '../pagination/pagination.service';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { QnARepository } from './qna.repository';
import { DatabaseService } from '../database/database.service';
import { GeminiService } from '../gemini/gemini.service';
import { BotRepository } from '../bot/bot.repository';

@Module({
  controllers: [QnAController],
  providers: [
    QnAService,
    QnARepository,
    DatabaseService,
    AIResponseService,
    PaginationService,
    APIResponse,
    GeminiService,
    BotRepository,
  ],
  exports: [QnAService, QnARepository],
})
export class QnAModule {}
