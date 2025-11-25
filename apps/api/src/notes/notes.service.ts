import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  create(_dto: CreateNoteDto) {
    // TODO: implement create note
    return {};
  }

  findAll(_query: QueryNotesDto) {
    // TODO: implement list notes
    return [];
  }

  findOne(_id: string) {
    // TODO: implement get note
    return {};
  }

  update(_id: string, _dto: UpdateNoteDto) {
    // TODO: implement update note
    return {};
  }

  remove(_id: string) {
    // TODO: implement delete note
    return {};
  }
}
