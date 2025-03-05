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
import { UserService } from "./user.service";
import { UserInterface } from "./entities/user.entity";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Users API List")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() userData: Partial<UserInterface>
  ): Promise<UserInterface> {
    return this.userService.create(userData);
  }

  @Get(":id")
  async findById(@Param("id") id: string): Promise<UserInterface> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException("UserInterface not found");
    }
    return user;
  }

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() userData: Partial<UserInterface>
  ): Promise<UserInterface> {
    const user = await this.userService.update(id, userData);
    if (!user) {
      throw new NotFoundException("UserInterface not found");
    }
    return user;
  }

  @Delete(":id")
  async delete(@Param("id") id: string): Promise<void> {
    const user = await this.userService.delete(id);
    if (!user) {
      throw new NotFoundException("UserInterface not found");
    }
  }
}
