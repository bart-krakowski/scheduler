import { Controller, Get } from '@nestjs/common';
import type { HealthResponse } from '@scheduler/contracts';
import { SchedulingClient } from '../scheduling/scheduling.client';

@Controller('health')
export class HealthController {
  constructor(private readonly scheduling: SchedulingClient) {}

  @Get()
  check(): Promise<HealthResponse> {
    return this.scheduling.health();
  }
}
