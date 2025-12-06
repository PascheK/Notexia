import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SyncNoteDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  updatedAt: string;
}

export class SyncRequestDto {
  @IsString()
  vaultId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncNoteDto)
  notes: SyncNoteDto[];
}
