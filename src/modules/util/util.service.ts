import { Injectable } from '@nestjs/common';
import { addMinutes } from 'date-fns';
import { randomInt } from 'node:crypto';

@Injectable()
export class UtilService {
  generateOtp(numLength: number = 8): string {
    return randomInt(0, Math.pow(10, numLength))
      .toString()
      .padStart(numLength, '0');
  }

  addMinutes(minutes: number = 0, date: Date = new Date()): Date {
    return addMinutes(date, minutes);
  }
}
