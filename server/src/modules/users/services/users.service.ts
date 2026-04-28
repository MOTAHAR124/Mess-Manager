import { Injectable } from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import { UpdateUserDto } from "../dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getUserById(id: string) {
    return this.usersRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async updateUser(id: string, data: UpdateUserDto) {
    return this.usersRepository.update(id, data);
  }
}
