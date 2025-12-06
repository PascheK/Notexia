// apps/api/src/folders/folders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFolderDto) {
    if (dto.parentId) {
      // vérifier que le parent appartient bien au user
      const parent = await this.prisma.folder.findFirst({
        where: { id: dto.parentId, userId },
      });
      if (!parent) {
        throw new BadRequestException('Dossier parent invalide');
      }
    }

    return this.prisma.folder.create({
      data: {
        name: dto.name,
        userId,
        parentId: dto.parentId ?? null,
      },
    });
  }

  async findTree(userId: string) {
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    // construire un arbre en mémoire
    const byId = new Map<string, any>();
    const roots: any[] = [];

    for (const f of folders) {
      byId.set(f.id, { ...f, children: [] as any[] });
    }

    for (const f of folders) {
      const node = byId.get(f.id);
      if (f.parentId && byId.has(f.parentId)) {
        byId.get(f.parentId).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findOne(userId: string, id: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Dossier introuvable');
    }

    return folder;
  }

  async update(userId: string, id: string, dto: UpdateFolderDto) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Dossier introuvable');
    }

    let parentId = folder.parentId;

    if (dto.parentId !== undefined) {
      // null = déplacer à la racine
      if (dto.parentId === null) {
        parentId = null;
      } else {
        // vérifier que le nouveau parent existe et appartient au user
        const parent = await this.prisma.folder.findFirst({
          where: { id: dto.parentId, userId },
        });
        if (!parent) {
          throw new BadRequestException('Nouveau dossier parent invalide');
        }
        // éviter de mettre un parent égal à soi-même
        if (parent.id === id) {
          throw new BadRequestException(
            'Un dossier ne peut pas être parent de lui-même',
          );
        }
        parentId = parent.id;
      }
    }

    return this.prisma.folder.update({
      where: { id },
      data: {
        name: dto.name ?? folder.name,
        parentId,
      },
    });
  }

  async remove(userId: string, id: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id, userId },
    });

    if (!folder) {
      throw new NotFoundException('Dossier introuvable');
    }

    // Prisma est configuré pour SetNull sur les notes et cascade sur les enfants
    await this.prisma.folder.delete({
      where: { id },
    });

    return { success: true };
  }
}
