import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  type Booking,
  type CreateBookingRequest,
  SchedulingPatterns,
} from '@scheduler/contracts';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(@Inject(BookingsService) private readonly bookings: BookingsService) {}

  @MessagePattern(SchedulingPatterns.createBooking)
  create(@Payload() request: CreateBookingRequest): Promise<Booking> {
    return this.bookings.create(request);
  }
}
