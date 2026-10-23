'use client'

import dynamic from 'next/dynamic'

const CalendarView = dynamic(
  () => import('@/components/calendar/calendar-view').then((mod) => mod.CalendarView),
  { ssr: false },
)

export function CalendarViewClient() {
  return <CalendarView />
}
