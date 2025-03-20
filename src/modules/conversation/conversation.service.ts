import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  APIResponse,
  IResponse,
} from 'src/internal/api-response/api-response.service';
import { ConversationRepository } from './conversation.repository';
import { BotRepository } from '../bot/bot.repository';
import { PaginationService } from '../pagination/pagination.service';
import { QnAService } from '../qna/qna.service';
import { GeminiService } from '../gemini/gemini.service';
import { UnresolvedQueryService } from '../message/unresolved-message.service';
import {
  ConversationResponseDto,
  CreateConversationDto,
  GetConversationListResponseDto,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { PaginationQuery } from 'src/entities/common.entity';
import { Message } from 'src/entities/message.entity';
import {
  QUERY_USER_TYPE,
  UNPROCESSED_MESSAGE_STATUS,
} from 'src/entities/enum.entity';
import {
  BotErrorMessages,
  ConversationErrorMessages,
} from 'src/entities/messages.entity';
import { generateSearchQuery } from 'src/helper/utils';

@Injectable()
export class ConversationService {
  constructor(
    private readonly conversationRepository: ConversationRepository,
    private readonly response: APIResponse,
    private readonly pagination: PaginationService,
    private readonly botRepo: BotRepository,
    private readonly qnaService: QnAService,
    private readonly geminiService: GeminiService,
    private readonly unresolvedQueryService: UnresolvedQueryService,
  ) {}

  async create(
    data: CreateConversationDto,
  ): Promise<IResponse<ConversationResponseDto>> {
    try {
      const { botId, userId, conversationId } = data;

      const validBot = await this.botRepo.findBotById(botId);
      if (!validBot) throw new Error(BotErrorMessages.INVALID_BOT_ID);

      if (conversationId) {
        const validConversation =
          await this.conversationRepository.findById(conversationId);
        if (!validConversation)
          throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);

        const existingConversation =
          await this.conversationRepository.findRecentConversationByUser(
            conversationId,
            botId,
          );

        if (existingConversation)
          return this.updateConversation(conversationId, data);
      }

      // Create new conversation
      data.message.timestamp = new Date();
      const conversation = await this.conversationRepository.create({
        botId,
        userId,
        messages: [data.message],
      });

      // Add bot response
      if (conversation) {
        const botMessage = await this.prepareBotResponse(
          data.message.content,
          conversation.botId?._id.toString(),
          conversation._id,
        );

        const conversationCreated =
          await this.conversationRepository.addMessageToConversation(
            conversation._id,
            botMessage,
          );

        return this.response.success(conversationCreated);
      }
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            ConversationErrorMessages.COULD_NOT_CREATE_CONVERSATION,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getConversationById(id: string): Promise<ConversationResponseDto> {
    try {
      const conversation = await this.conversationRepository.findById(id);
      if (!conversation)
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);

      return this.response.success(conversation);
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message || ConversationErrorMessages.INVALID_CONVERSATION_ID,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateConversation(
    id: string,
    data: UpdateConversationDto,
  ): Promise<any> {
    try {
      const conversation = await this.conversationRepository.findById(id);
      if (!conversation)
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);

      if (!data?.message) return this.response.success(conversation);

      // Add user message
      await this.conversationRepository.addMessageToConversation(
        conversation._id ?? id,
        data.message,
      );

      // Add bot response
      const botMessage = await this.prepareBotResponse(
        data.message.content,
        conversation.botId?._id.toString(),
        conversation._id ?? id,
      );
      console.log('🚀 ~ ConversationService ~ botMessage:', botMessage);

      const botMessageUpdate =
        await this.conversationRepository.addMessageToConversation(
          conversation._id ?? id,
          botMessage,
        );

      return this.response.success(botMessageUpdate);
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message ||
            ConversationErrorMessages.COULD_NOT_UPDATE_CONVERSATION,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getConversations(
    condition: { q: string },
    pagination: PaginationQuery,
  ): Promise<GetConversationListResponseDto> {
    try {
      const query = generateSearchQuery(condition);
      const { data, page, limit, total } = await this.pagination.paginate(
        this.conversationRepository.findAll.bind(this.conversationRepository),
        this.conversationRepository.countConversations.bind(
          this.conversationRepository,
        ),
        query,
        pagination,
      );

      return this.response.success(data, { page, limit, total });
    } catch (error) {
      throw new Error('Error fetching conversations');
    }
  }

  async deleteConversation(id: string): Promise<string> {
    try {
      const conversation = await this.conversationRepository.findById(id);
      if (!conversation)
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);

      const deleted = await this.conversationRepository.deleteConversationById({
        _id: id,
      });
      if (!deleted)
        throw new Error(
          ConversationErrorMessages.COULD_NOT_DELETE_CONVERSATION,
        );

      return this.response.success({
        message: 'Conversation deleted successfully',
      });
    } catch (error) {
      throw new HttpException(
        {
          message:
            error.message || ConversationErrorMessages.INVALID_CONVERSATION_ID,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Helper method to prepare bot response
  private async prepareBotResponse(
    userQuery: string,
    botId: string,
    conversationId: string,
  ): Promise<Message> {
    const botMessage: Message = {
      content: '',
      role: QUERY_USER_TYPE.BOT,
      timestamp: new Date(),
    };

    const searchResults = await this.qnaService.searchEnsembleByQuestion({
      question: userQuery,
      botId: botId,
      limit: 3,
    });
    console.log('🚀 231~ ConversationService ~ botId:', botId);

    if (searchResults.data.length === 0) {
      const botDetails = await this.botRepo.findBotById(botId);
      botMessage.content =
        botDetails?.fallbackMessage ??
        `Unable to answer this currently, Can you ask me another question? \n${
          botDetails?.handoverToHuman ? botDetails?.handOverToHumanMessage : ''
        }`;

      this.unresolvedQueryService.create({
        query: userQuery,
        botId: botId,
        conversationId: conversationId,
        status: UNPROCESSED_MESSAGE_STATUS.PENDING,
      });
    } else {
      botMessage.content = await this.geminiService.enhanceAnswer(
        searchResults.data[0]?.question,
        searchResults.data[0]?.answer,
      );
    }

    return botMessage;
  }
}
