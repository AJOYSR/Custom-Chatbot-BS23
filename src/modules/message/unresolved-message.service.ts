import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateUnresolvedQueryDto,
  GetUnresolvedQueryListResponseDto,
  UnresolvedQueryResponseDto,
} from "./dto/unsolved-message.dto";
import { UnresolvedQueryRepository } from "./unresolved-message.repository";
import { UNPROCESSED_MESSAGE_STATUS } from "src/entities/enum.entity";

@Injectable()
export class UnresolvedQueryService {
  constructor(private readonly unresolvedQueryRep: UnresolvedQueryRepository) {}

  // Create an unresolved query
  async create(
    createUnresolvedQueryDto: CreateUnresolvedQueryDto
  ): Promise<UnresolvedQueryResponseDto> {
    const query = await this.unresolvedQueryRep.create(
      createUnresolvedQueryDto
    );
    return { data: query };
  }

  // Get an unresolved query by ID
  async getById(id: string): Promise<UnresolvedQueryResponseDto> {
    const query = await this.unresolvedQueryRep.findById(id);
    if (!query) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
    return { data: query };
  }

  // Get a list of unresolved queries with pagination
  async getAll(
    page: number,
    limit: number
  ): Promise<GetUnresolvedQueryListResponseDto> {
    const { total, data } = await this.unresolvedQueryRep.findAll(page, limit);
    return { total, page, limit, data };
  }

  // Update the status of an unresolved query
  async updateStatus(
    id: string,
    status: UNPROCESSED_MESSAGE_STATUS
  ): Promise<UnresolvedQueryResponseDto> {
    const updatedQuery = await this.unresolvedQueryRep.updateStatus(id, status);
    if (!updatedQuery) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
    return { data: updatedQuery };
  }

  // Delete an unresolved query by ID
  async deleteById(id: string): Promise<{ message: string }> {
    const deleted = await this.unresolvedQueryRep.deleteById(id);
    if (!deleted) {
      throw new NotFoundException(`Query with ID ${id} not found`);
    }
    return { message: `Query with ID ${id} deleted successfully` };
  }
}
