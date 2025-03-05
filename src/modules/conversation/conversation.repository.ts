import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConversationModel } from "./entities/conversation.model";
import { BaseRepository } from "src/common/repositories/base.repository";
import { ConversationInterface } from "./entities/conversation.entity";

@Injectable()
export class ConversationRepository extends BaseRepository<ConversationInterface> {
  constructor(
    @InjectModel(ConversationModel.name)
    private readonly conversationModel: Model<ConversationInterface>
  ) {
    super(conversationModel);
  }

  async findByBotId(botId: string): Promise<ConversationInterface[]> {
    return this.find({ botId });
  }

  async findByUserId(userId: string): Promise<ConversationInterface[]> {
    return this.find({ userId });
  }
}
