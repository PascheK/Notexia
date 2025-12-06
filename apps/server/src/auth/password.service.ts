import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { SecurityConfig } from '../common/configs/config.interface';

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const securityConfig = this.configService.get<SecurityConfig>(
      'security',
    ) ?? {
      bcryptSaltOrRound: 10,
    };
    const saltOrRounds: string | number = securityConfig.bcryptSaltOrRound;

    if (typeof saltOrRounds === 'number') {
      return saltOrRounds;
    }

    const parsed = Number(saltOrRounds);
    return Number.isInteger(parsed) ? parsed : saltOrRounds;
  }

  constructor(private configService: ConfigService) {}

  validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }

  hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds);
  }
}
