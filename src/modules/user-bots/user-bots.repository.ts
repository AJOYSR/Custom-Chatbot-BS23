import { Injectable } from '@nestjs/common';
import { UserBotsModel } from './entities/user-bots.model';
import { CreateUserBotDto } from './dtos/user-bots.dto';
import { UserBots } from './entities/user-bots.entity';

@Injectable()
export class UserBotsRepository {
  async create(createUserBotDto: CreateUserBotDto): Promise<UserBots> {
    console.log(
      '🚀 ~ UserBotsRepository ~ create ~ createUserBotDto:',
      createUserBotDto,
    );
    try {
      return await UserBotsModel.create(createUserBotDto);
    } catch (error) {
      console.log('🚀 ~ UserBotsRepository ~ create ~ error:', error);

      throw error;
    }
  }

  async findByUserAndBot(
    userId: string,
    botId: string,
  ): Promise<UserBots | null> {
    try {
      return await UserBotsModel.findOne({ userId, botId });
    } catch (error) {
      console.log('🚀 ~ UserBotsRepository ~ error:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<UserBots | null> {
    try {
      return await UserBotsModel.findById(id);
    } catch (error) {
      console.log('🚀 ~ UserBotsRepository ~ findById ~ error:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateData: Partial<UserBots>,
  ): Promise<UserBots | null> {
    try {
      return await UserBotsModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
    } catch (error) {
      console.log('🚀 ~ UserBotsRepository ~ error:', error);
      throw error;
    }
  }

  async findUserBots(userId: string): Promise<UserBots[]> {
    try {
      return await UserBotsModel.find({ userId, isActive: true });
    } catch (error) {
      console.log('🚀 ~ UserBotsRepository ~ findUserBots ~ error:', error);
      throw error;
    }
  }
}
