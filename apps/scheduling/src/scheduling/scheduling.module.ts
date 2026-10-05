import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NOTIFICATIONS_QUEUE } from '@scheduler/contracts';
import { BookingsController } from './bookings.controller';
import { BookingsService, NOTIFICATIONS_CLIENT } from './bookings.service';
import { SlotsController } from './slots.controller';
import { SlotsService } from './slots.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: NOTIFICATIONS_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.getOrThrow<string>('RABBITMQ_URL')],
            queue: NOTIFICATIONS_QUEUE,
            queueOptions: { durable: true },
            persistent: true,
          },
        }),
      },
    ]),
  ],
  controllers: [SlotsController, BookingsController],
  providers: [SlotsService, BookingsService],
})
export class SchedulingModule {}
