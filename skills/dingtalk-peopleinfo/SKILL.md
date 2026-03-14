---
name: dingtalk-peopleinfo
description: "DingTalk org structure + people info lookup. Use to read departments recursively and list users with fields like userid, name, mobile, birthday, dept_ids. Includes scripts for org and user detail queries."
---

# DingTalk People & Org Info

## Core workflow
1) Read App Key/App Secret/Corp ID/Agent ID from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` when needed.
2) Get token from `gettoken` using appKey/appSecret.
3) List all department IDs with `topapi/v2/department/listsubid` starting from dept_id=1.
3) Fetch department info via `topapi/v2/department/get` for name/parent.
4) List users via `topapi/v2/user/list` per dept (cursor pagination).
5) Fetch user detail via `topapi/v2/user/get` for mobile/birthday/etc.

## Scripts
- `scripts/list_depts.js`
- `scripts/list_users_by_dept.js`
- `scripts/get_user_detail.js`
- `scripts/org_full_with_people.js`

## Notes
- Birthday may be empty if not filled in DingTalk profile or hidden by permissions.
- If birthday is expected, verify permission scope and field name in `topapi/v2/user/get` response.
