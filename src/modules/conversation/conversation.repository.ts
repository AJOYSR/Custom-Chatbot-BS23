import { Injectable } from '@nestjs/common';
import { ConversationInterface } from './entities/conversation.entity';
import { ConversationModel } from './entities/conversation.model';
import { Message } from 'src/entities/message.entity';

@Injectable()
export class ConversationRepository {
  // Create a new conversation
  async create(
    createConversationDto: ConversationInterface,
  ): Promise<ConversationInterface> {
    try {
      const conversation = await ConversationModel.create(
        createConversationDto,
      );
      return conversation?.toObject();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // Get a conversation by ID
  async findById(id: string): Promise<ConversationInterface | null> {
    try {
      return await ConversationModel.findById(id)
        .populate([
          {
            path: 'botId',
            select: 'name _id',
          },
        ])
        .lean();
    } catch (error) {
      console.log('🚀 ~ ConversationRepository ~ findById ~ error:', error);
      return null;
    }
  }

  // Get a list of conversations with pagination
  async findAll(
    query: Record<string, any>,
    pagination: { skip: number; limit: number },
  ): Promise<ConversationInterface[]> {
    try {
      return await ConversationModel.find(query)
        .populate([
          {
            path: 'botId',
            select: 'name _id',
          },
        ])
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean();
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  // Get the total number of conversations
  async countConversations(query: Record<string, any>): Promise<number> {
    try {
      return await ConversationModel.countDocuments(query).lean();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async findRecentConversationByUser(
    conversationId: string,
    botId: string,
    hourFrame: number = 24,
  ): Promise<ConversationInterface | null> {
    const cutoffTime = new Date(Date.now() - hourFrame * 60 * 60 * 1000);

    return await ConversationModel.findOne({
      _id: conversationId,
      botId,
      updatedAt: { $gte: cutoffTime },
    })
      .sort({ updatedAt: -1 })
      .lean();
  }

  async addMessageToConversation(
    conversationId: string,
    message: Message,
  ): Promise<ConversationInterface | null> {
    return await ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        $push: { messages: message },
        updatedAt: new Date(),
      },
      { new: true },
    ).lean();
  }

  // Delete a conversation by ID

  async deleteConversationById(
    query: any,
    options?: { session?: any },
  ): Promise<ConversationInterface | null> {
    try {
      return await ConversationModel.findOneAndDelete(query, options).lean();
    } catch (error: any) {
      console.log(error.message);
      return null;
    }
  }
}
