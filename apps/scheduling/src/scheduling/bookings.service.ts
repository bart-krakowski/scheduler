import { Inject, Injectable, Logger } from '@nestjs/common';
import { type ClientProxy, RpcException } from '@nestjs/microservices';
import {
  type Booking,
  type BookingCreatedEvent,
  type CreateBookingRequest,
  Events,
  type RpcError,
} from '@scheduler/contracts';
import { eq, sql } from 'drizzle-orm';
import { lastValueFrom } from 'rxjs';
import { DATABASE, type Database } from '../database/database';
import { bookings, organizations } from '../database/schema';
import { parseInstant } from './instant';
import { slotRules } from './schedule';
import { SlotsService } from './slots.service';

export const NOTIFICATIONS_CLIENT = Symbol('NOTIFICATIONS_CLIENT');

const DEFAULT_ORGANIZATION_SLUG = 'default';
const BOOKING_LOCK_KEY = 'bookings';

function rpcError(status: number, message: string): RpcException {
  return new RpcException({ status, message } satisfies RpcError);
}

function toBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    ruleId: row.ruleId,
    resourceId: row.resourceId,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
  };
}

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  @Inject(DATABASE)
  private readonly db: Database;

  @Inject(NOTIFICATIONS_CLIENT)
  private readonly notifications: ClientProxy;

  constructor(private readonly slots: SlotsService) {}

  async create({ ruleId, start }: CreateBookingRequest): Promise<Booking> {
    if (!slotRules.some((rule) => rule.id === ruleId)) {
      throw rpcError(404, `Unknown rule: ${ruleId}`);
    }
    const startAt = parseInstant(start);

    const row = await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`select pg_advisory_xact_lock(hashtext(${BOOKING_LOCK_KEY}))`,
      );

      const slot = await this.slots.find(ruleId, startAt, tx);
      const resourceId = slot?.availableResourceIds[0];
      if (!slot || !resourceId) throw rpcError(409, 'Slot is not available');

      const [organization] = await tx
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, DEFAULT_ORGANIZATION_SLUG));
      if (!organization) throw rpcError(500, 'Default organization is missing');

      const [inserted] = await tx
        .insert(bookings)
        .values({
          organizationId: organization.id,
          ruleId,
          resourceId,
          startAt: new Date(slot.startEpochMs),
          endAt: new Date(slot.endEpochMs),
        })
        .returning();
      return inserted;
    });

    const booking = toBooking(row);
    await this.publishCreated(booking);
    return booking;
  }

  private async publishCreated(event: BookingCreatedEvent): Promise<void> {
    try {
      await lastValueFrom(
        this.notifications.emit(Events.bookingCreated, event),
        {
          defaultValue: undefined,
        },
      );
    } catch (error) {
      this.logger.error(
        `Failed to publish ${Events.bookingCreated} for ${event.id}`,
        error,
      );
    }
  }
}
