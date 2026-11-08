import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const parsedValue = this.schema.parse(value);
    return parsedValue;
    // try {
    //   const parsedValue = this.schema.parse(value);
    //   return parsedValue;
    // } catch (error) {
    //   throw new BadRequestException('Validation failed');
    // }
  }
}
