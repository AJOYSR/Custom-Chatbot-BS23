import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ConversationModel,
  ConversationSchema,
} from "./entities/conversation.model";
import { ConversationController } from "./conversation.controller";
import { ConversationService } from "./conversation.service";
import { ConversationRepository } from "./conversation.repository";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ConversationModel.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [ConversationController],
  providers: [ConversationService, ConversationRepository],
  exports: [ConversationService],
})
export class ConversationModule {}
