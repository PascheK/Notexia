import { Injectable } from '@nestjs/common';
import { RewriteNoteDto } from './dto/rewrite-note.dto';

@Injectable()
export class AiService {
  rewrite(_dto: RewriteNoteDto) {
    // TODO: call AI provider to rewrite note
    return {};
  }
}
