import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "src/common/repositories/base.repository";
import { BotInterface } from "./entities/bot.entity";
import { BotModel } from "./entities/bot.model";

@Injectable()
export class BotRepository extends BaseRepository<BotInterface> {
  constructor(
    @InjectModel(BotModel.name)
    private readonly botModel: Model<BotInterface>
  ) {
    super(botModel);
  }
}
