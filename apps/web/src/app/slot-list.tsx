import type { Slot } from '@tanstack/time';
import { connection } from 'next/server';
import { fetchSlots } from '@/lib/api';

function groupByDay(slots: Array<Slot>): Map<string, Array<Slot>> {
  const days = new Map<string, Array<Slot>>();
  for (const slot of slots) {
    const day = slot.start.slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), slot]);
  }
  return days;
}

export async function SlotList() {
  await connection();
  const { slots } = await fetchSlots();

  if (slots.length === 0) {
    return <p className="text-zinc-500">No open slots.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {[...groupByDay(slots)].map(([day, daySlots]) => (
        <li key={day} className="flex flex-col gap-2">
          <h2 className="font-medium">{day}</h2>
          <div className="flex flex-wrap gap-2">
            {daySlots.map((slot) => (
              <span
                key={`${slot.ruleId}-${slot.startEpochMs}`}
                className="rounded border border-zinc-300 px-2 py-1 font-mono text-sm dark:border-zinc-700"
              >
                {slot.start.slice(11, 16)}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
