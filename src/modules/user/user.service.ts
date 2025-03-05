import { Injectable } from "@nestjs/common";

import * as bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { UserInterface } from "./entities/user.entity";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(userData: Partial<UserInterface>): Promise<UserInterface> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userRepository.create(userData);
  }

  async findById(id: string): Promise<UserInterface | null> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<UserInterface | null> {
    return this.userRepository.findByEmail(email);
  }

  async update(
    id: string,
    userData: Partial<UserInterface>
  ): Promise<UserInterface | null> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userRepository.update(id, userData);
  }

  async delete(id: string): Promise<UserInterface | null> {
    return this.userRepository.delete(id);
  }
}
