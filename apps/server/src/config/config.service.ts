import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get<T = string>(key: string, defaultValue?: T): T | undefined {
    return this.config.get<T>(key) ?? defaultValue;
  }
}
