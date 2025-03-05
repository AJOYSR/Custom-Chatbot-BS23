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
import { MessageService } from "../message.service";
import { MessageInterface } from "../entities/message.entity";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Messages API List")
@Controller("messages")
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(
    @Body() messageData: Partial<MessageInterface>
  ): Promise<MessageInterface> {
    return this.messageService.create(messageData);
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<MessageInterface> {
    const message = await this.messageService.findById(id);
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    return message;
  }

  @Get("conversation/:conversationId")
  async findByConversationId(
    @Param("conversationId") conversationId: string
  ): Promise<MessageInterface[]> {
    return this.messageService.findByConversationId(conversationId);
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() messageData: Partial<MessageInterface>
  ): Promise<MessageInterface> {
    const message = await this.messageService.update(id, messageData);
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    return message;
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    const message = await this.messageService.delete(id);
    if (!message) {
      throw new NotFoundException("Message not found");
    }
  }
}
