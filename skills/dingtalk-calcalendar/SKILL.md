---
name: dingtalk-calcalendar
description: "DingTalk calendar (日历/日程) query/update/delete via v1.0 calendar APIs. Use for: listing calendars, listing events by time range, fetching a specific event, moving an event to a new date while keeping time, updating start/end times, or deleting an event."
---

# DingTalk Calendar Workflow

## Required inputs
- **unionId** for the calendar owner
- **calendarId** (use `primary` if the main calendar)
- **eventId** when updating/deleting a specific event

## Scripts
All scripts read App Key/App Secret from `/root/.openclaw/workspace/GLOBAL_MEMORY.md`.

### 1) List calendars
```
node scripts/list_calendars.js <unionId>
```

### 2) List events in a time range
Use ISO timestamps.
```
node scripts/list_events.js <unionId> <calendarId> <startTime ISO> <endTime ISO>
```

### 3) Get a single event
```
node scripts/get_event.js <unionId> <calendarId> <eventId>
```

### 4) Move event to a new date (keep time)
Use this when user says “same time, different date”.
```
node scripts/move_event_date.js <unionId> <calendarId> <eventId> <YYYY-MM-DD> [timeZone]
```

### 5) Update event time range
Provide full date-time with timezone offset.
```
node scripts/update_event_time.js <unionId> <calendarId> <eventId> <startDateTime ISO> <endDateTime ISO> [timeZone]
```

### 6) Delete event
```
node scripts/delete_event.js <unionId> <calendarId> <eventId>
```

## Time zone handling (important)
- **Always include `timeZone` and a full ISO `dateTime` with offset** (e.g., `2020-01-25T21:00:00+08:00`).
- Avoid sending `date` for non–all-day events, or the API can treat it as all-day.
- Default timeZone in scripts is `Asia/Shanghai`.

## Recommended flow
1. List calendars → find `calendarId`.
2. List events in range → identify `eventId`.
3. Get event → confirm summary/time.
4. Update or delete.

## Safety checks
- Confirm with user before delete.
- If multiple events match, ask for disambiguation.
