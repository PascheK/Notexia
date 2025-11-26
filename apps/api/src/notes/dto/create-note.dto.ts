// apps/api/src/notes/dto/create-note.dto.ts
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NoteFormat, NoteStatus } from '@prisma/client';

export class CreateNoteDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(NoteFormat)
  format?: NoteFormat;

  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}