import type { GenerateSlotsResult } from '@tanstack/time';

export const SchedulingPatterns = {
  health: 'scheduling.health',
  listSlots: 'slots.list',
  createBooking: 'bookings.create',
} as const;

export interface ListSlotsRequest {
  from: string;
  to: string;
}

export type ListSlotsResponse = GenerateSlotsResult;

export interface CreateBookingRequest {
  ruleId: string;
  start: string;
}

export interface Booking {
  id: string;
  ruleId: string;
  resourceId: string;
  startAt: string;
  endAt: string;
}

export interface HealthResponse {
  status: 'ok';
}

export interface RpcError {
  status: number;
  message: string;
}
