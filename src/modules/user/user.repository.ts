import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserInterface } from "./entities/user.entity";
import { UserModel } from "./entities/user.model";
import { BaseRepository } from "src/common/repositories/base.repository";

@Injectable()
export class UserRepository extends BaseRepository<UserInterface> {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserInterface>
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return this.findOne({ email });
  }
}
