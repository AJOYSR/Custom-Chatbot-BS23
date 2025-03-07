import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MessageInterface } from "./entities/message.entity";
import { CreateMessageDto } from "./dto/message.dto";
import { MessageModel } from "./entities/message.model";

@Injectable()
export class MessageRepository {
  // Create a new message
  async create(createMessageDto: CreateMessageDto): Promise<MessageInterface> {
    try {
      const message = await MessageModel.create(createMessageDto);
      return message?.toObject(); // Convert Mongoose document to plain object
    } catch (err) {
      console.error("Error creating message:", err);
      throw err; // Re-throw the error for proper handling upstream
    }
  }

  // Get a message by ID
  async findById(id: string): Promise<MessageInterface | null> {
    try {
      const message = await MessageModel.findById(id).lean().exec();
      return message || null;
    } catch (err) {
      console.error(`Error finding message with ID ${id}:`, err);
      throw err;
    }
  }

  // Get a list of messages with pagination
  async findAll(page: number, limit: number): Promise<MessageInterface[]> {
    try {
      const skip = (page - 1) * limit;
      const messages = await MessageModel.find()
        .skip(skip)
        .limit(limit)
        .lean()
        .exec();
      return messages;
    } catch (err) {
      console.error("Error fetching messages:", err);
      throw err;
    }
  }

  // Get the total number of messages
  async countMessages(): Promise<number> {
    try {
      const count = await MessageModel.countDocuments().exec();
      return count;
    } catch (err) {
      console.error("Error counting messages:", err);
      throw err;
    }
  }
}
