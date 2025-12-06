import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
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

  //
  // REGISTER
  //
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.password);

    let user: User;
    try {
      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          displayName: dto.displayName ?? null,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email déjà utilisé');
      }
      throw error;
    }

    const accessToken = await this.signToken(user.id, user.email);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  //
  // LOGIN
  //
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const passwordValid = await this.passwordService.validatePassword(
      dto.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const accessToken = await this.signToken(user.id, user.email);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  //
  // HELPER: générer le JWT
  //
  private async signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret =
      this.config.get<string>('JWT_SECRET') ?? 'dev-secret-change-me'; // pour le dev uniquement

    const expiresIn = this.config.get<number>('JWT_EXPIRES_IN') ?? '7d'; // ex: "7d", "1h"
    const options: JwtSignOptions = { secret, expiresIn };
    return this.jwt.signAsync(payload, options);
  }

  //
  // HELPER: enlever le passwordHash de la réponse
  //
  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
