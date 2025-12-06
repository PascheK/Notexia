// apps/api/src/notes/dto/update-note.dto.ts
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NoteFormat, NoteStatus } from '@prisma/client';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(NoteFormat)
  format?: NoteFormat;

  @IsOptional()
  @IsEnum(NoteStatus)
  status?: NoteStatus;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsUUID()
  folderId?: string;
}