import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BotController } from "./bot.controller";
import { BotService } from "./bot.service";
import { BotRepository } from "./bot.repository";
import { BotModel, BotSchema } from "./entities/bot.model";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BotModel.name, schema: BotSchema }]),
  ],
  controllers: [BotController],
  providers: [BotService, BotRepository],
  exports: [BotService],
})
export class BotModule {}
