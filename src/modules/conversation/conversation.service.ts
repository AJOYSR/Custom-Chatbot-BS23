import {
  APIResponse,
  IResponse,
} from 'src/internal/api-response/api-response.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConversationRepository } from './conversation.repository';
import {
  ConversationResponseDto,
  CreateConversationDto,
  GetConversationListResponseDto,
  UpdateConversationDto,
} from './dto/conversation.dto';
import { PaginationService } from '../pagination/pagination.service';
import { BotRepository } from '../bot/bot.repository';
import {
  BotErrorMessages,
  ConversationErrorMessages,
} from 'src/entities/messages.entity';
import { ConversationInterface } from './entities/conversation.entity';
import { PaginationQuery } from 'src/entities/common.entity';
import { generateSearchQuery } from 'src/helper/utils';
import { QnAService } from '../qna/qna.service';
import { GeminiService } from '../gemini/gemini.service';
import {
  QUERY_USER_TYPE,
  UNPROCESSED_MESSAGE_STATUS,
} from 'src/entities/enum.entity';
import { Message } from 'src/entities/message.entity';
import { UnresolvedQueryService } from '../message/unresolved-message.service';

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
      // If the bot is not valid
      if (!validBot) {
        throw new Error(BotErrorMessages.INVALID_BOT_ID);
      }

      const validConversation =
        await this.conversationRepository.findById(conversationId);

      if (!validConversation && conversationId) {
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);
      } else {
        const existingConversation =
          await this.conversationRepository.findRecentConversationByUser(
            conversationId,
            botId,
          );

        if (existingConversation) {
          return await this.conversationRepository.addMessageToConversation(
            existingConversation._id,
            data.message,
          );
        } else {
          const modifiedData: ConversationInterface = {
            botId,
            messages: [data.message],
            userId,
          };

          const conversation =
            await this.conversationRepository.create(modifiedData);

          return this.response.success(conversation);
        }
      }
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || BotErrorMessages.COULD_NOT_DELETE_BOT,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Get a conversation by ID
  async getConversationById(id: string): Promise<ConversationResponseDto> {
    try {
      const validConversation = await this.conversationRepository.findById(id);
      if (!validConversation) {
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);
      }

      return this.response.success(validConversation);
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

  // Update a conversation by ID
  async updateConversation(
    id: string,
    data: UpdateConversationDto,
  ): Promise<any> {
    try {
      const conversation = await this.conversationRepository.findById(id);
      if (!conversation) {
        throw new Error(ConversationErrorMessages.INVALID_CONVERSATION_ID);
      }

      if (!data?.message) {
        return this.response.success(conversation);
      }

      // Add user message
      await this.conversationRepository.addMessageToConversation(
        conversation._id ?? id,
        data.message,
      );

      // Search for similar questions
      const searchResults = await this.qnaService.searchEnsembleByQuestion({
        question: data.message.content,
        botId: conversation.botId.toString(),
        limit: 3,
      });

      // Prepare bot message
      const botMessage: Message = {
        content: '',
        role: QUERY_USER_TYPE.BOT,
        timestamp: new Date(),
      };

      // Handle no search results case
      if (searchResults.data.length === 0) {
        const botDetails = await this.botRepo.findBotById(conversation.botId);
        console.log('🚀 ~ ConversationService ~ botDetails:', botDetails);
        botMessage.content =
          botDetails?.fallbackMessage ??
          `Unable to answer this currently, Can you ask me another question? \n${
            botDetails?.handoverToHuman ? botDetails.handOverToHumanMessage : ''
          }`;
        this.unresolvedQueryService.create({
          query: data.message.content,
          botId: conversation.botId.toString(),
          conversationId: conversation._id ?? '',
          status: UNPROCESSED_MESSAGE_STATUS.PENDING,
        });
      } else {
        // Get enhanced answer
        botMessage.content = await this.geminiService.enhanceAnswer(
          searchResults.data[0]?.question,
          searchResults.data[0]?.answer,
        );
      }

      // Add bot response
      const botMessageUpdate =
        await this.conversationRepository.addMessageToConversation(
          conversation._id ?? id,
          botMessage,
        );

      return this.response.success(botMessageUpdate);

      // Option 1: Return just the bot message (current approach)
      return this.response.success(botMessageUpdate);
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
  // Get a list of conversations with pagination
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
}
