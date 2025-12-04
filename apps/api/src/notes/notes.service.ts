// apps/api/src/notes/notes.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { NoteStatus, VaultType } from '../../generated/prisma/client';

import { AddTagsDto } from './dto/add-tags.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateDefaultVault(userId: string) {
    let vault = await this.prisma.vault.findFirst({
      where: {
        userId,
        type: VaultType.REMOTE,
      },
    });

    if (!vault) {
      vault = await this.prisma.vault.create({
        data: {
          userId,
          name: 'Default',
          type: VaultType.REMOTE,
        },
      });
    }

    return vault;
  }

  async create(userId: string, dto: CreateNoteDto) {
    const vault = await this.getOrCreateDefaultVault(userId);

    const note = await this.prisma.note.create({
      data: {
        title: dto.title,
        content: dto.content,
        format: dto.format ?? 'MARKDOWN',
        status: dto.status ?? NoteStatus.ACTIVE,
        userId,
        folderId: dto.folderId ?? null,
        vaultId: vault.id,
        path: null,
      },
    });

    return note;
  }

  async findAll(userId: string, query: QueryNotesDto) {
    const {
      search,
      folderId,
      status,
      isPinned,
      tagId,
      page = 1,
      pageSize = 20,
    } = query;

    const where: any = {
      userId,
    };

    if (folderId) where.folderId = folderId;
    if (status) where.status = status;
    if (typeof isPinned === 'boolean') where.isPinned = isPinned;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tagId) {
      // filtrer sur les notes qui ont au moins ce tag
      where.tags = {
        some: {
          tagId,
        },
      };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.note.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      items,
      page,
      pageSize,
      total,
    };
  }

  async findOne(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!note) {
      throw new NotFoundException('Note introuvable');
    }

    return note;
  }

  async update(userId: string, id: string, dto: UpdateNoteDto) {
    const existing = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Note introuvable');
    }

    const note = await this.prisma.note.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        content: dto.content ?? existing.content,
        format: dto.format ?? existing.format,
        status: dto.status ?? existing.status,
        isPinned: dto.isPinned ?? existing.isPinned,
        folderId: dto.folderId === undefined ? existing.folderId : dto.folderId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return note;
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Note introuvable');
    }

    const note = await this.prisma.note.update({
      where: { id },
      data: {
        status: NoteStatus.TRASHED,
        deletedAt: new Date(),
      },
    });

    return note;
  }

  //
  // TAGS <-> NOTE
  //

  async addTagsToNote(userId: string, noteId: string, dto: AddTagsDto) {
    // vérifier que la note appartient au user
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });
    if (!note) {
      throw new NotFoundException('Note introuvable');
    }

    // vérifier que les tags appartiennent au user
    const tags = await this.prisma.tag.findMany({
      where: {
        id: { in: dto.tagIds },
        userId,
      },
    });

    if (tags.length !== dto.tagIds.length) {
      throw new BadRequestException(
        'Certains tags sont introuvables ou n’appartiennent pas à cet utilisateur',
      );
    }

    // créer les liens NoteTag (en évitant les doublons)
    await this.prisma.noteTag.createMany({
      data: dto.tagIds.map((tagId) => ({
        noteId,
        tagId,
      })),
      skipDuplicates: true,
    });

    // retourner la note avec ses tags
    return this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async removeTagFromNote(userId: string, noteId: string, tagId: string) {
    // vérifier que la note appartient au user
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });
    if (!note) {
      throw new NotFoundException('Note introuvable');
    }

    // vérifier que le tag appartient au user
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag introuvable');
    }

    await this.prisma.noteTag.deleteMany({
      where: {
        noteId,
        tagId,
      },
    });

    return this.prisma.note.findUnique({
      where: { id: noteId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }
}
