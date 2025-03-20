import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateUnresolvedQueryDto,
  GetUnresolvedQueryListResponseDto,
  UnresolvedQueryResponseDto,
  UpdateUnresolvedQueryDto,
} from './dto/unsolved-message.dto';
import { UnresolvedQueryRepository } from './unresolved-message.repository';

import { APIResponse } from 'src/internal/api-response/api-response.service';
import { UnsolvedErrorMessages } from 'src/entities/messages.entity';
import { PaginationQuery } from 'src/entities/common.entity';
import { generateSearchQuery } from 'src/helper/utils';
import { PaginationService } from '../pagination/pagination.service';
import { toObjectId } from 'src/utils';

@Injectable()
export class UnresolvedQueryService {
  constructor(
    private readonly unresolvedQueryRep: UnresolvedQueryRepository,
    private readonly response: APIResponse,
    private readonly pagination: PaginationService,
  ) {}

  // Create an unresolved query
  async create(
    createUnresolvedQueryDto: CreateUnresolvedQueryDto,
  ): Promise<UnresolvedQueryResponseDto> {
    const { conversationId, botId } = createUnresolvedQueryDto;
    const query = await this.unresolvedQueryRep.create({
      ...createUnresolvedQueryDto,
      conversationId: toObjectId(conversationId),
      botId: toObjectId(botId),
    });
    return this.response.success(query);
  }

  // Get an unresolved query by ID
  async getById(id: string): Promise<UnresolvedQueryResponseDto> {
    try {
      const validQuery = await this.unresolvedQueryRep.findById(id);
      if (!validQuery) {
        throw new Error(UnsolvedErrorMessages.INVALID_UNSOLVED_QUERY_ID);
      }
      const query = await this.unresolvedQueryRep.findById(id);
      if (!query) {
        throw new Error(UnsolvedErrorMessages.INVALID_UNSOLVED_QUERY_ID);
      }
      return { data: query };
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Get a list of unresolved queries with pagination
  async getAll(
    condition: { q: string; botId?: string },
    pagination: PaginationQuery,
  ): Promise<GetUnresolvedQueryListResponseDto> {
    const query = generateSearchQuery(condition);
    const { data, page, limit, total } = await this.pagination.paginate(
      this.unresolvedQueryRep.findAllUnresolvedQuery.bind(
        this.unresolvedQueryRep,
      ),
      this.unresolvedQueryRep.totalUnsolvedQueryCount.bind(
        this.unresolvedQueryRep,
      ),
      query,
      pagination,
    );

    return this.response.success(data, { page, limit, total });
  }

  // Update the status of an unresolved query
  async updateStatus(
    id: string,
    data: UpdateUnresolvedQueryDto,
  ): Promise<UnresolvedQueryResponseDto> {
    try {
      const validQuery = await this.unresolvedQueryRep.findById(id);
      if (!validQuery) {
        throw new Error(UnsolvedErrorMessages.INVALID_UNSOLVED_QUERY_ID);
      }

      const { status } = data;
      const updatedQuery = await this.unresolvedQueryRep.updateStatus(
        id,
        status,
      );

      if (!updatedQuery) {
        throw new Error(UnsolvedErrorMessages.COULD_NOT_UPDATE_UNSOLVED_QUERY);
      }
      return this.response.success(updatedQuery);
    } catch (err) {
      throw new HttpException(
        {
          message:
            err.message ||
            UnsolvedErrorMessages.COULD_NOT_UPDATE_UNSOLVED_QUERY,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Delete an unresolved query by ID
  async deleteById(id: string): Promise<string> {
    try {
      const validQuery = await this.unresolvedQueryRep.findById(id);
      if (!validQuery) {
        throw new Error(UnsolvedErrorMessages.INVALID_UNSOLVED_QUERY_ID);
      }

      const deleted = await this.unresolvedQueryRep.deleteById(id);
      if (!deleted) {
        throw new Error(UnsolvedErrorMessages.COULD_NOT_DELETE_UNSOLVED_QUERY);
      }
      return this.response.success({
        message: 'Unresolved query deleted successfully',
      });
    } catch (err) {
      throw new HttpException(
        {
          message:
            err.message ||
            UnsolvedErrorMessages.COULD_NOT_DELETE_UNSOLVED_QUERY,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
