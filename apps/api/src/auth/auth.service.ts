import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(_dto: RegisterDto) {
    // TODO: implement registration (check existing user, hash password, create user, return token + user)
    return {};
  }

  async login(_dto: LoginDto) {
    // TODO: implement login (validate credentials, return token + user)
    return {};
  }
}
