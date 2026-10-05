import type { GenerateSlotsResult } from '@tanstack/time';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

export async function fetchSlots(): Promise<GenerateSlotsResult> {
  const response = await fetch(`${API_URL}/slots`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`GET /slots failed: ${response.status}`);
  return response.json();
}
