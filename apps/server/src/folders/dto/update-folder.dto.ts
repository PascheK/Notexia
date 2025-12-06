// apps/api/src/folders/dto/update-folder.dto.ts
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateFolderDto {
  @IsOptional()
  @IsString()
  name?: string;

  // pour déplacer un dossier dans un autre / à la racine
  @IsOptional()
  @IsUUID()
  parentId?: string | null;
}
