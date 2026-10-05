import { BadRequestException } from '@nestjs/common';

export function parseDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()))
    throw new BadRequestException(`Invalid date: ${value}`);
  return date;
}
