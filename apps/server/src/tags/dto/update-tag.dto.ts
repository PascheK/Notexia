// apps/api/src/tags/dto/update-tag.dto.ts
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#(?:[0-9a-fA-F]{3}){1,2}$/, {
    message: 'color doit être un code hexadécimal (ex: #FF0000)',
  })
  color?: string | null;
}
