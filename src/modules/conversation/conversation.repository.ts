import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConversationInterface } from "./entities/conversation.entity";
import { CreateConversationDto } from "./dto/conversation.dto";
import { ConversationModel } from "./entities/conversation.model";

@Injectable()
export class ConversationRepository {
  // Create a new conversation
  async create(
    createConversationDto: CreateConversationDto
  ): Promise<ConversationInterface> {
    try {
      const conversation = await ConversationModel.create(
        createConversationDto
      );
      return conversation?.toObject();
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  // Get a conversation by ID
  async findById(id: string): Promise<ConversationInterface | null> {
    return ConversationModel.findById(id).exec();
  }

  // Get a list of conversations with pagination
  async findAll(page: number, limit: number): Promise<ConversationInterface[]> {
    const skip = (page - 1) * limit;
    return ConversationModel.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "messages",
        select: "_id sender content",
      })
      .lean();
  }

  // Get the total number of conversations
  async countConversations(): Promise<number> {
    return ConversationModel.countDocuments().lean();
  }
}
