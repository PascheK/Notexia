import { IsString } from 'class-validator';

export class RewriteNoteDto {
  @IsString()
  noteId: string;

  @IsString()
  prompt: string;
}
