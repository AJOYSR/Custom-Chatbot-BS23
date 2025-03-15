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
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ total: number; data: UnresolvedQueryInterface[] }> {
    try {
      const skip = (page - 1) * limit;
      const [total, data] = await Promise.all([
        UnresolvedQueryModel.countDocuments().exec(),
        UnresolvedQueryModel.find().skip(skip).limit(limit).lean().exec(),
      ]);
      return { total, data };
    } catch (err) {
      console.error('Error fetching unresolved queries:', err);
      throw new Error('Failed to fetch unresolved queries');
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
      const result = await UnresolvedQueryModel.findByIdAndDelete(id).exec();
      return result ? true : false;
    } catch (err) {
      console.error(`Error deleting unresolved query ${id}:`, err);
      throw new Error('Failed to delete unresolved query');
    }
  }
}
