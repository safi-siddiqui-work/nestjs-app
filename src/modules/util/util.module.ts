import { Module } from '@nestjs/common';
import { UtilService } from './util.service.js';

@Module({
  exports: [UtilService],
  providers: [UtilService],
})
export class UtilModule {}
