import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingNotificationsController } from './bookings/booking-notifications.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
  ],
  controllers: [BookingNotificationsController],
})
export class AppModule {}
