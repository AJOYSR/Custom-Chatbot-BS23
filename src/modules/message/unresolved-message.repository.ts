import { Injectable } from '@nestjs/common';
import { CreateUnresolvedQueryDto } from './dto/unsolved-message.dto';
import { UnresolvedQueryModel } from './entities/unresolved-message.model';
import { UnresolvedQueryInterface } from './entities/unresolved-message.entity';
import { UNPROCESSED_MESSAGE_STATUS } from 'src/entities/enum.entity';

@Injectable()
export class UnresolvedQueryRepository {
  // Create a new unresolved query
  async create(
    createUnresolvedQueryDto: CreateUnresolvedQueryDto,
  ): Promise<UnresolvedQueryInterface> {
    try {
      const query = await UnresolvedQueryModel.create(createUnresolvedQueryDto);
      return query.toObject(); // Convert Mongoose document to plain object
    } catch (err) {
      console.error('Error creating unresolved query:', err);
      throw new Error('Failed to create unresolved query');
    }
  }

  // Get an unresolved query by ID
  async findById(id: string): Promise<UnresolvedQueryInterface | null> {
    try {
      const query = await UnresolvedQueryModel.findById(id).lean().exec();
      return query || null;
    } catch (err) {
      console.error(`Error finding unresolved query with ID ${id}:`, err);
      throw new Error('Failed to find unresolved query');
    }
  }

  // Get all unresolved queries with pagination

  async findAllUnresolvedQuery(
    query: Record<string, any>,
    pagination: { skip: number; limit: number },
  ): Promise<UnresolvedQueryInterface[] | null> {
    try {
      // Check if we need to fix the population path
      const populateOptions = [
        {
          path: 'botId',
          select: 'name _id',
        },
        {
          path: 'conversationId',
          select: '_id',
        },
      ];

      return await UnresolvedQueryModel.find(query)
        .populate(populateOptions)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    } catch (err) {
      console.log('🚀 ~ UnresolvedQueryRepository ~ err:', err);
      return [];
    }
  }

  async totalUnsolvedQueryCount(query: Record<string, any>): Promise<number> {
    try {
      return await UnresolvedQueryModel.countDocuments(query).lean();
    } catch (err) {
      console.log(
        '🚀 ~ UnresolvedQueryRepository ~ totalUnsolvedQueryCount ~ err:',
        err,
      );

      return null;
    }
  }

  // Update the status of an unresolved query
  async updateStatus(
    id: string,
    status: UNPROCESSED_MESSAGE_STATUS,
  ): Promise<UnresolvedQueryInterface | null> {
    try {
      const updatedQuery = await UnresolvedQueryModel.findByIdAndUpdate(
        id,
        { status },
        { new: true, lean: true },
      ).exec();
      return updatedQuery;
    } catch (err) {
      console.error(`Error updating status of unresolved query ${id}:`, err);
      throw new Error('Failed to update unresolved query status');
    }
  }

  // Delete an unresolved query by ID
  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await UnresolvedQueryModel.findByIdAndDelete(id).lean();
      return result ? true : false;
    } catch (err) {
      console.error(`Error deleting unresolved query ${id}:`, err);
      throw new Error('Failed to delete unresolved query');
    }
  }
}
