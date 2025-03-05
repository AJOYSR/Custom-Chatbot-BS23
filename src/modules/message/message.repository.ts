import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MessageModel } from "./entities/message.model";
import { MessageInterface } from "./entities/message.entity";
import { BaseRepository } from "src/common/repositories/base.repository";

@Injectable()
export class MessageRepository extends BaseRepository<MessageInterface> {
  constructor(
    @InjectModel(MessageModel.name)
    private readonly messageModel: Model<MessageInterface>
  ) {
    super(messageModel);
  }

  async findByConversationId(
    conversationId: string
  ): Promise<MessageInterface[]> {
    return this.find({ conversationId });
  }
}
