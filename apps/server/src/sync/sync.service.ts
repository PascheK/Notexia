import { Injectable } from '@nestjs/common';

import { SyncRequestDto } from './dto/sync-request.dto';

@Injectable()
export class SyncService {
  async health() {
    return {
      status: 'ok',
      time: new Date().toISOString(),
    };
  }

  async syncNotes(payload: SyncRequestDto) {
    return {
      status: 'ok',
      received: payload.notes?.length ?? 0,
      serverTime: new Date().toISOString(),
    };
  }
}
