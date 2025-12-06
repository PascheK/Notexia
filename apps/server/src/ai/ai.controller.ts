import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { RewriteNoteDto } from './dto/rewrite-note.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('rewrite')
  rewrite(@Body() dto: RewriteNoteDto) {
    return this.aiService.rewrite(dto);
  }
}
