---
name: dingtalk-process-search
description: "DingTalk approval template/instance lookup and querying. Use to list approval process codes by userid, fetch instance IDs by time range, and pull instance details (form_component_values). Includes scripts for listbyuserid, listids/list, and get instance details."
---

# DingTalk Approval Process Search

## Core workflow (required)
1) **Read config** from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` (App Key/App Secret/Corp ID/Agent ID) when needed.
2) **Get token** using appKey/appSecret.
3) **List visible processes** for a user: `topapi/process/listbyuserid` → get `process_code`.
4) **Query instances** by time range (RECOMMENDED):
   - Use **`topapi/processinstance/listids`** with `process_code`, `start_time`, `end_time`, `cursor`.
   - `start_time` / `end_time` **must be millisecond timestamps** (整数毫秒), not seconds.
   - Paginate with `has_more` + `next_cursor`.
5) **Fetch details** per instance: `topapi/processinstance/get`.
6) If empty: verify **time range / timezone**, **process_code**, and **permission scope**.

## Scripts (preferred)
- `scripts/list_process_by_user.js` → list processes for a userid.
- `scripts/list_instance_ids.js` → list instance IDs by process_code + time range.
- `scripts/get_instance.js` → fetch details by process_instance_id.
- `scripts/query_month_by_process.js` → one-shot monthly query (listids + get) for a process.

## Notes
- Time range **must be milliseconds** (e.g., `Date.now()`), not seconds.
- **Do not call `processinstance/list` without `process_code`** (it will error).
- Pagination: `listids` returns `has_more` + `next_cursor`; keep looping.
- Use explicit timezone in Date string when building timestamps (e.g., `2026-01-01T00:00:00-03:00`).
