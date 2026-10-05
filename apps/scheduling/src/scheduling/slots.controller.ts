import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  type ListSlotsRequest,
  type ListSlotsResponse,
  SchedulingPatterns,
} from '@scheduler/contracts';
import { parseInstant } from './instant';
import { SlotsService } from './slots.service';

@Controller()
export class SlotsController {
  constructor(private readonly slots: SlotsService) {}

  @MessagePattern(SchedulingPatterns.listSlots)
  list(@Payload() { from, to }: ListSlotsRequest): Promise<ListSlotsResponse> {
    return this.slots.list(parseInstant(from), parseInstant(to));
  }
}
