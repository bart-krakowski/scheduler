import type { Booking } from './scheduling';

export const Events = {
  bookingCreated: 'booking.created',
} as const;

export type BookingCreatedEvent = Booking;
