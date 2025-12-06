// apps/api/src/notes/notes.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddTagsDto } from './dto/add-tags.dto';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(
    @CurrentUser() user: { userId: string; email: string },
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: { userId: string; email: string },
    @Query() query: QueryNotesDto,
  ) {
    return this.notesService.findAll(user.userId, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ) {
    return this.notesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.notesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') id: string,
  ) {
    return this.notesService.remove(user.userId, id);
  }

  //
  // TAGS <-> NOTE
  //

  @Post(':id/tags')
  addTags(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') noteId: string,
    @Body() dto: AddTagsDto,
  ) {
    return this.notesService.addTagsToNote(user.userId, noteId, dto);
  }

  @Delete(':id/tags/:tagId')
  removeTag(
    @CurrentUser() user: { userId: string; email: string },
    @Param('id') noteId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.notesService.removeTagFromNote(user.userId, noteId, tagId);
  }
}
