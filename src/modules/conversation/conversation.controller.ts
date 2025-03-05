import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
} from "@nestjs/common";
import { ConversationInterface } from "./entities/conversation.entity";
import { ConversationService } from "./conversation.service";
import { ApiTags } from "@nestjs/swagger";
@ApiTags("Conversations API List")
@Controller("conversations")
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async create(
    @Body() conversationData: Partial<ConversationInterface>
  ): Promise<ConversationInterface> {
    return this.conversationService.create(conversationData);
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<ConversationInterface> {
    const conversation = await this.conversationService.findById(id);
    if (!conversation) {
      throw new NotFoundException("ConversationInterface not found");
    }
    return conversation;
  }

  @Get("bot/:botId")
  async findByBotId(
    @Param("botId") botId: string
  ): Promise<ConversationInterface[]> {
    return this.conversationService.findByBotId(botId);
  }

  @Get("user/:userId")
  async findByUserId(
    @Param("userId") userId: string
  ): Promise<ConversationInterface[]> {
    return this.conversationService.findByUserId(userId);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() conversationData: Partial<ConversationInterface>
  ): Promise<ConversationInterface> {
    const conversation = await this.conversationService.update(
      id,
      conversationData
    );
    if (!conversation) {
      throw new NotFoundException("ConversationInterface not found");
    }
    return conversation;
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    const conversation = await this.conversationService.delete(id);
    if (!conversation) {
      throw new NotFoundException("ConversationInterface not found");
    }
  }
}
