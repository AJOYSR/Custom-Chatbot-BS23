import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MessageController } from "./controllers/message.controller";
import { MessageService } from "./message.service";
import { MessageModel, MessageSchema } from "./entities/message.model";
import { MessageRepository } from "./message.repository";
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageModel.name, schema: MessageSchema },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageRepository],
  exports: [MessageService],
})
export class MessageModule {}
