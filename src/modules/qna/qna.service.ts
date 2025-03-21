/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIResponseService } from '../ai-response/ai-response.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PaginationService } from '../pagination/pagination.service';
import { PaginationInterface } from 'src/interface/common';
import {
  CreateVectorBatchDto,
  CreateVectorDto,
  QnaDto,
  QnaListResponseDto,
  SearchVectorByQuestionDto,
  SearchVectorDto,
  UpdateVectorDto,
} from './dto/qna.dto';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { QnARepository } from './qna.repository';
import { GeminiService } from '../gemini/gemini.service';
import { PaginationQueryDto } from '../pagination/types';
import { generateSearchQuery } from 'src/helper/utils';
import { BotRepository } from '../bot/bot.repository';
import {
  BotErrorMessages,
  QnaErrorMessages,
} from 'src/entities/messages.entity';

@Injectable()
export class QnAService {
  constructor(
    private readonly qnaRepo: QnARepository,
    private readonly aiResponse: AIResponseService,
    private readonly paginationService: PaginationService,
    private readonly apiResponse: APIResponse,
    private readonly geminiService: GeminiService,
    private readonly botRepo: BotRepository,
  ) {}

  async create(createVectorDto: CreateVectorDto): Promise<QnaDto> {
    try {
      const { question, answer, botId } = createVectorDto;
      const validBot = await this.botRepo.findBotById(botId);
      // If the bot is not valid
      if (!validBot) {
        throw new Error(BotErrorMessages.INVALID_BOT_ID);
      }
      // const embedding = await this.aiResponse.generateEmbeddings(question);
      const embedding = await this.geminiService.generateEmbeddings(question);
      const createdQna = await this.qnaRepo.insertVector(
        question,
        answer,
        botId,
        embedding,
      );

      if (!createdQna) {
        throw new Error(QnaErrorMessages.COULD_NOT_CREATE_QNA);
      }
      const { questions: similarQuestions = [] } =
        (await this.geminiService.generateSimilarQuestions(question)) ?? {};
      console.log(
        '🚀 ~ QnAService ~ create ~ similarQuestions:',
        similarQuestions,
      );

      if (similarQuestions?.length > 0) {
        const insertPromises = similarQuestions?.map(
          async (similarQuestion) => {
            try {
              const similarEmbedding =
                await this.geminiService.generateEmbeddings(similarQuestion);
              return this.qnaRepo.insertVector(
                similarQuestion,
                answer,
                botId,
                similarEmbedding,
              );
            } catch (error) {
              console.error(
                `Error processing similar question "${similarQuestion}":`,
                error,
              );
            }
          },
        );

        await Promise.all(insertPromises);
      }

      return this.apiResponse.success(createdQna);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || QnaErrorMessages.COULD_NOT_CREATE_QNA,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(condition: { q: string }, pagination: PaginationQueryDto) {
    const query = generateSearchQuery(condition);
    console.log('🚀 ~ QnAService ~ findAll ~ query:', query);

    // Paginate the list of users based on the generated query, role IDs query, and pagination settings
    const { data, page, limit, total } = await this.paginationService.paginate(
      this.qnaRepo.findAllVectors.bind(this.qnaRepo),
      this.qnaRepo.countVectors.bind(this.qnaRepo),
      query,
      pagination,
    );

    // Return a success response containing the paginated list

    return this.apiResponse.success(data, { page, limit, total });
  }

  async createBatch(createVectorBatchDto: CreateVectorBatchDto) {
    const client = await this.qnaRepo.beginTransaction();

    try {
      const results = [];

      // Process each vector in the batch
      for (const vectorDto of createVectorBatchDto.vectors) {
        const { question, answer, botId } = vectorDto;
        // const embedding = await this.aiResponse.generateEmbeddings(question);
        const embedding = await this.geminiService.generateEmbeddings(question);
        const result = await this.qnaRepo.insertVector(
          question,
          answer,
          botId,
          embedding,
        );
        results.push(result);
      }

      await this.qnaRepo.commitTransaction(client);

      return this.apiResponse.success({
        success: true,
        count: results.length,
        vectors: results,
      });
    } catch (error) {
      await this.qnaRepo.rollbackTransaction(client);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const validQna = await this.qnaRepo.findVectorById(id);
      // If the qna is not valid
      if (!validQna) {
        throw new Error(QnaErrorMessages.INVALID_QNA_ID);
      }

      return this.apiResponse.success(validQna);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || QnaErrorMessages.COULD_NOT_CREATE_QNA,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async DeleteOne(id: string) {
    try {
      const validQna = await this.qnaRepo.findVectorById(id);
      // If the qna is not valid
      if (!validQna) {
        throw new Error(QnaErrorMessages.INVALID_QNA_ID);
      }

      const deletedQna = await this.qnaRepo.deleteVectorById(id);
      if (!deletedQna) {
        throw new Error(QnaErrorMessages.COULD_NOT_DELETE_QNA);
      }

      return this.apiResponse.success(deletedQna, {
        message: 'QnA deleted successfully',
      });
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || QnaErrorMessages.COULD_NOT_DELETE_QNA,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update(id: string, updateVectorDto: UpdateVectorDto) {
    try {
      const validQna = await this.qnaRepo.findVectorById(id);
      // If the qna is not valid
      if (!validQna) {
        throw new Error(QnaErrorMessages.INVALID_QNA_ID);
      }

      const { question, answer } = updateVectorDto;
      let newEmbedding = undefined;

      // Only generate new embeddings if question is being updated
      if (question) {
        // embedding = await this.aiResponse.generateEmbeddings(question);
        newEmbedding = await this.geminiService.generateEmbeddings(question);
      }
      const data = {
        question,
        answer,
        embedding: JSON.stringify(newEmbedding),
      };

      const updatedQna = await this.qnaRepo.updateVector(id, data);
      return this.apiResponse.success(updatedQna);
    } catch (error) {
      throw new HttpException(
        {
          message: error.message || QnaErrorMessages.COULD_NOT_UPDATE_QNA,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async searchSimilar(searchDto: SearchVectorDto) {
    const { embedding, limit = 5 } = searchDto;
    const results = await this.qnaRepo.searchBySimilarity(embedding, limit);
    return this.apiResponse.success(results);
  }

  async searchCosine(searchDto: SearchVectorDto) {
    const { embedding, limit = 5 } = searchDto;
    const results = await this.qnaRepo.searchByCosine(embedding, limit);
    return this.apiResponse.success(results);
  }

  async searchSimilarByQuestion(searchDto: SearchVectorByQuestionDto) {
    const { question, botId, limit = 5 } = searchDto;
    // const embeddingRes = await this.aiResponse.generateEmbeddings(question);
    const embeddingRes = await this.geminiService.generateEmbeddings(question);
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchSimilarByQuestion(
      embedding,
      botId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchCosineByQuestion(searchDto: SearchVectorByQuestionDto) {
    const { question, botId, limit = 5 } = searchDto;
    // const embeddingRes = await this.aiResponse.generateEmbeddings(question);
    const embeddingRes = await this.geminiService.generateEmbeddings(question);
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchCosineByQuestion(
      embedding,
      botId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchHybridByQuestion(searchDto: SearchVectorByQuestionDto) {
    const { question, botId, limit = 5 } = searchDto;
    // const embeddingRes = await this.aiResponse.generateEmbeddings(question);
    const embeddingRes = await this.geminiService.generateEmbeddings(question);
    const embedding = JSON.stringify(embeddingRes);

    const results = await this.qnaRepo.searchHybridByQuestion(
      embedding,
      question,
      botId,
      limit,
    );
    return this.apiResponse.success(results);
  }

  async searchEnsembleByQuestion(
    searchDto: SearchVectorByQuestionDto,
  ): Promise<QnaListResponseDto> {
    // Get results from both methods
    const cosineResults = await this.searchCosineByQuestion(searchDto);
    const hybridResults = await this.searchHybridByQuestion(searchDto);

    // Combine and re-rank
    const combinedResults = new Map();

    // Process cosine results
    cosineResults.data.forEach((item) => {
      combinedResults.set(item.id, {
        ...item,
        cosine_score: item.cosine_similarity,
        hybrid_score: 0,
        combined_score: item.cosine_similarity * 0.5,
      });
    });

    // Process hybrid results
    hybridResults.data.forEach((item) => {
      if (combinedResults.has(item.id)) {
        // Update existing entry
        const existing = combinedResults.get(item.id);
        existing.hybrid_score = 1 - item.hybrid_score; // Convert to similarity
        existing.combined_score += existing.hybrid_score * 0.5;
      } else {
        // Add new entry
        combinedResults.set(item.id, {
          ...item,
          cosine_score: 0,
          hybrid_score: 1 - item.hybrid_score, // Convert to similarity
          combined_score: (1 - item.hybrid_score) * 0.5,
        });
      }
    });

    // Sort by combined score, filter values > 0.40, and limit
    const sortedResults = Array.from(combinedResults.values())
      .filter(
        (result) =>
          result.cosine_similarity > 0.4 &&
          result.cosine_score > 0.4 &&
          result.hybrid_score > 0.4 &&
          result.combined_score > 0.4,
      )
      .sort((a, b) => b.combined_score - a.combined_score)
      .slice(0, searchDto.limit || 5);

    return this.apiResponse.success(sortedResults);
  }
}
