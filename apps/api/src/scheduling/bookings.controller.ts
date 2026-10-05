import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import type { Booking } from '@scheduler/contracts';
import { parseDate } from './parse-date';
import { SchedulingClient } from './scheduling.client';

interface CreateBookingBody {
  ruleId?: unknown;
  start?: unknown;
}

@Controller('bookings')
export class BookingsController {
  constructor(private readonly scheduling: SchedulingClient) {}

  @Post()
  create(@Body() body: CreateBookingBody): Promise<Booking> {
    if (typeof body.ruleId !== 'string')
      throw new BadRequestException('ruleId must be a string');
    if (typeof body.start !== 'string')
      throw new BadRequestException('start must be a string');
    const start = parseDate(body.start);
    return this.scheduling.createBooking({
      ruleId: body.ruleId,
      start: start.toISOString(),
    });
  }
}
