import { CalendarViewClient } from '@/components/calendar/calendar-view-client';
import './calendar.css';

export default function CalendarPage() {
  return (
    <main className="min-h-screen bg-black">
      <CalendarViewClient />
    </main>
  );
}
