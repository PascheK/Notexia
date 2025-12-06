import { Body, Controller, Get, Post } from '@nestjs/common';

import { SyncRequestDto } from './dto/sync-request.dto';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('health')
  health() {
    return this.syncService.health();
  }

  @Post('notes')
  syncNotes(@Body() payload: SyncRequestDto) {
    return this.syncService.syncNotes(payload);
  }
}
