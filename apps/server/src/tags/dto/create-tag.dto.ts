// apps/api/src/tags/dto/create-tag.dto.ts
import { IsOptional, IsString, Matches } from 'class-validator';

export class CreateTagDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  // optionnel : valider un hex type #RRGGBB
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'color doit être un code hexadécimal (ex: #FF0000)',
  })
  color?: string;
}
