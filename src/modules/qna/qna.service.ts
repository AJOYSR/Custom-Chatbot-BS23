/* eslint-disable @typescript-eslint/no-unused-vars */
import { AIResponseService } from '../ai-response/ai-response.service';
import { Injectable } from '@nestjs/common';
import { PaginationService } from '../pagination/pagination.service';
import { PaginationInterface } from 'src/interface/common';
import {
  CreateVectorBatchDto,
  CreateVectorDto,
  QnaListResponseDto,
  SearchVectorByQuestionDto,
  SearchVectorDto,
  UpdateVectorDto,
} from './dto/qna.dto';
import { APIResponse } from 'src/internal/api-response/api-response.service';
import { QnARepository } from './qna.repository';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class QnAService {
  constructor(
    private readonly qnaRepo: QnARepository,
    private readonly aiResponse: AIResponseService,
    private readonly paginationService: PaginationService,
    private readonly apiResponse: APIResponse,
    private readonly geminiService: GeminiService,
  ) {}

  async create(createVectorDto: CreateVectorDto) {
    const { question, answer, botId } = createVectorDto;
    // const embedding = await this.aiResponse.generateEmbeddings(question);
    const embedding = await this.geminiService.generateEmbeddings(question);
    const result = await this.qnaRepo.insertVector(
      question,
      answer,
      botId,
      embedding,
    );
    return result;
  }

  async findAll(pagination: PaginationInterface) {
    const getVectors = async (_query: any, options: any) => {
      const vectors = await this.qnaRepo.findAllVectors(
        options.skip,
        options.limit,
      );
      return this.apiResponse.success(vectors);
    };

    const getVectorsCount = async (_query: any) => {
      return await this.qnaRepo.countVectors();
    };

    return this.paginationService.paginate(
      getVectors,
      getVectorsCount,
      {},
      pagination,
    );
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
    const vector = await this.qnaRepo.findVectorById(id);
    return this.apiResponse.success(vector);
  }

  async update(id: string, updateVectorDto: UpdateVectorDto) {
    // First check if vector exists
    await this.qnaRepo.findVectorById(id);

    const { question, answer } = updateVectorDto;
    let embedding = undefined;

    // Only generate new embeddings if question is being updated
    if (question) {
      // embedding = await this.aiResponse.generateEmbeddings(question);
      embedding = await this.geminiService.generateEmbeddings(question);
    }

    // Build the update query dynamically based on what fields are provided
    const updateFields = [];
    const updateValues = [];
    let paramCounter = 1;

    if (question) {
      updateFields.push(`question = $${paramCounter}`);
      updateValues.push(question);
      paramCounter++;
    }

    if (answer) {
      updateFields.push(`answer = $${paramCounter}`);
      updateValues.push(answer);
      paramCounter++;
    }

    if (embedding) {
      updateFields.push(`embedding = $${paramCounter}`);
      updateValues.push(JSON.stringify(embedding));
      paramCounter++;
    }

    if (updateFields.length === 0) {
      const existingVector = await this.qnaRepo.findVectorById(id);
      return existingVector;
    }

    const result = await this.qnaRepo.updateVector(
      id,
      updateFields,
      updateValues,
    );
    return this.apiResponse.success(result);
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
