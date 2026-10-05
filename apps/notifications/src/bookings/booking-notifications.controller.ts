import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  type RmqContext,
} from '@nestjs/microservices';
import { type BookingCreatedEvent, Events } from '@scheduler/contracts';

@Controller()
export class BookingNotificationsController {
  private readonly logger = new Logger(BookingNotificationsController.name);

  @EventPattern<string>(Events.bookingCreated)
  onBookingCreated(
    @Payload() booking: BookingCreatedEvent,
    @Ctx() context: RmqContext,
  ): void {
    this.logger.log(
      `Booking ${booking.id} confirmed for ${booking.resourceId} at ${booking.startAt}`,
    );
    context.getChannelRef().ack(context.getMessage());
  }
}
