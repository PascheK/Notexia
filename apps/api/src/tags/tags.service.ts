import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  create(_dto: CreateTagDto) {
    // TODO: implement create tag
    return {};
  }

  findAll() {
    // TODO: implement list tags
    return [];
  }

  remove(_id: string) {
    // TODO: implement delete tag
    return {};
  }
}
