import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ConversationModel,
  ConversationSchema,
} from './entities/conversation.model';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './conversation.repository';
import { PaginationService } from '../pagination/pagination.service';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { BotRepository } from '../bot/bot.repository';
import { QnAModule } from '../qna/qna.module';
import { GeminiModule } from '../gemini/gemini.module';

import { GeminiService } from '../gemini/gemini.service';
import { UnresolvedQueryModule } from '../message/unresolved-message.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationModel.name, schema: ConversationSchema },
    ]),
    QnAModule,
    GeminiModule,
    UnresolvedQueryModule,
  ],
  controllers: [ConversationController],
  providers: [
    ConversationService,
    ConversationRepository,
    APIResponse,
    PaginationService,
    BotRepository,
    GeminiService,
  ],
  exports: [ConversationService],
})
export class ConversationModule {}
