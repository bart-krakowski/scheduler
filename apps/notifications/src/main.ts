import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  type AsyncMicroserviceOptions,
  Transport,
} from '@nestjs/microservices';
import { NOTIFICATIONS_QUEUE } from '@scheduler/contracts';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<AsyncMicroserviceOptions>(
    AppModule,
    {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: Transport.RMQ,
        options: {
          urls: [config.getOrThrow<string>('RABBITMQ_URL')],
          queue: NOTIFICATIONS_QUEUE,
          queueOptions: { durable: true },
          noAck: false,
          prefetchCount: 10,
        },
      }),
    },
  );
  app.enableShutdownHooks();
  await app.listen();
}
await bootstrap();
