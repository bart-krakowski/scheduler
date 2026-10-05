---
name: core
description: >
  Framework-agnostic TanStack Time calendar engine. Load when creating a
  calendar with createCalendar, choosing features via calendarFeatures and
  stockFeatures, adding events, reading getEvents/getDays, navigating with
  goToPreviousPeriod/goToNextPeriod, or using date utilities (add, subtract,
  startOf, endOf, format, parse, range, clamp) from @tanstack/time.
metadata:
  type: core
  library: '@tanstack/time'
  library_version: '0.0.0'
sources:
  - 'TanStack/time:docs/overview.md'
  - 'TanStack/time:docs/installation.md'
  - 'TanStack/time:docs/quick-start.md'
---

# TanStack Time — Core

`@tanstack/time` is headless: it owns time math and calendar state, never UI.
Framework adapters (`@tanstack/react-time`, `@tanstack/solid-time`) subscribe
to the core store. Load the adapter skill for component code.

## Create a calendar

```ts
import { createCalendar, calendarFeatures, stockFeatures } from '@tanstack/time'

const calendar = createCalendar({
  viewMode: { value: 1, unit: 'week' },
  timeZone: 'UTC',
  features: calendarFeatures(stockFeatures),
  events: [
    {
      id: '1',
      title: 'Team Standup',
      start: '2024-03-18T09:00:00',
      end: '2024-03-18T10:00:00',
    },
  ],
})

calendar.getEvents()
calendar.getDays()
calendar.goToNextPeriod()
```

## Features are opt-in

Behavior (move, resize, recurrence, dependencies, constraints, availability,
working time, booking) comes from features passed to `calendarFeatures`.
`stockFeatures` is the full stock set. Pass a narrower array to ship less:

```ts
import { calendarFeatures, eventMoveFeature, eventResizeFeature } from '@tanstack/time'

calendarFeatures([eventMoveFeature, eventResizeFeature])
```

A method exists on the instance only when its feature is registered. Calling
`calendar.getSlots` without `bookingFeature` is a type error, not a runtime
fallback.

## Date utilities

Use the exported helpers instead of hand-rolled `Date` arithmetic. They are
Temporal-backed and time-zone aware.

```ts
import { add, startOf } from '@tanstack/time'

add(new Date(), { duration: { days: 30 } })
```

## Common mistakes

- Omitting `timeZone`. Always pass it explicitly; results depend on it.
- Importing hooks from `@tanstack/time`. Hooks live in the adapter packages.
- Inventing helpers such as `addDays`. Only `add` with a `duration` exists.
- Mutating objects returned by `getEvents()`. Write through calendar methods
  so validation and undo/redo see the change.
