// apps/api/src/tags/tags.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTagDto) {
    try {
      const tag = await this.prisma.tag.create({
        data: {
          name: dto.name,
          color: dto.color ?? null,
          userId,
        },
      });
      return tag;
    } catch (err: any) {
      // gestion simple de l'unicité (userId, name)
      if (err.code === 'P2002') {
        throw new BadRequestException(
          'Un tag avec ce nom existe déjà pour cet utilisateur',
        );
      }
      throw err;
    }
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!tag) {
      throw new NotFoundException('Tag introuvable');
    }

    return tag;
  }

  async update(userId: string, id: string, dto: UpdateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Tag introuvable');
    }

    try {
      const tag = await this.prisma.tag.update({
        where: { id },
        data: {
          name: dto.name ?? existing.name,
          color: dto.color === undefined ? existing.color : dto.color, // permet de passer à null
        },
      });

      return tag;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new BadRequestException(
          'Un tag avec ce nom existe déjà pour cet utilisateur',
        );
      }
      throw err;
    }
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.tag.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Tag introuvable');
    }

    // Prisma est configuré pour supprimer les NoteTag en cascade
    await this.prisma.tag.delete({
      where: { id },
    });

    return { success: true };
  }
}
