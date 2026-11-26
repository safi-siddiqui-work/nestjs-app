import { Injectable } from '@nestjs/common';
import {
  addMinutes,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from 'date-fns';
import { randomInt, randomUUID } from 'node:crypto';

@Injectable()
export class UtilService {
  generateOtp(numLength: number = 8): string {
    return randomInt(0, Math.pow(10, numLength))
      .toString()
      .padStart(numLength, '0');
  }

  generateUuid(): string {
    return randomUUID();
  }

  addMinutes(minutes: number = 0, date: Date = new Date()): Date {
    return addMinutes(date, minutes);
  }

  differenceVerbose(
    later: Date = new Date(),
    earlier: Date = new Date(),
  ): string {
    const d = differenceInDays(later, earlier);
    if (d > 1) {
      return `${d} days`;
    }
    const h = differenceInHours(later, earlier);
    if (h > 1) {
      return `${h} hours`;
    }
    const m = differenceInMinutes(later, earlier);
    if (m > 1) {
      return `${m} minutes`;
    }
    const s = differenceInSeconds(later, earlier);
    if (s > 1) {
      return `${s} seconds`;
    }
    return 'some time';
  }
}
