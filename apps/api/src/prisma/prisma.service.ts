import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const pool = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    super({ adapter: pool });
  }
  async onModuleInit() {
    await this.$connect()
      .then(() => {
        console.log('JWT Secret:', process.env.JWT_SECRET);
        console.log('Connected to DB');
      })
      .catch((err) => console.log(err));
    await this.$connect();
  }
}
