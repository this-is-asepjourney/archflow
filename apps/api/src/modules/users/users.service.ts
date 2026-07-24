import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import { User, UserPublic } from './user.entity';
import { CreateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  // In-memory store
  private users: User[] = [];

  async create(dto: CreateUserDto): Promise<UserPublic> {
    const existing = this.users.find((u) => u.email === dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: User = {
      id: uuidv4(),
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      createdAt: new Date(),
    };

    this.users.push(user);
    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }

  async findById(id: string): Promise<UserPublic> {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  sanitize(user: User): UserPublic {
    const { password, ...rest } = user;
    return rest;
  }
}
