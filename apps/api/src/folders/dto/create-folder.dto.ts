// apps/api/src/folders/dto/create-folder.dto.ts
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
