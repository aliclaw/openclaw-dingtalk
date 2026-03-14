---
name: dingtalk-sendmessage
description: "DingTalk proactive message sending (private chat / robot O2O). Use to send direct messages to users via robot batchSend, verify send responses, and troubleshoot #content# template issues."
---

# DingTalk Proactive Messaging

## Important: Find userid First!
**Before sending messages, you MUST find the recipient's userid:**
- Use `dingtalk-peopleinfo` skill to lookup userid by name or department
- Or use the script `scripts/send_robot_private_by_name.js` which automatically resolves names to userids via peopleinfo APIs

## Core workflow
1) Read App Key/App Secret/Corp ID/Agent ID from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` when needed.
2) **Resolve userid first** (required!):
   - If you only have a name/手机号, **must** use `dingtalk-peopleinfo` skill or peopleinfo APIs to get `userid`
   - Cannot send without a valid userid from the org directory
   - Use `scripts/send_robot_private_by_name.js` for automatic lookup
3) Get token: `POST https://api.dingtalk.com/v1.0/oauth2/accessToken` with `{appKey, appSecret}`.
4) Send private message via robot:
   - `POST https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend`
   - Header: `x-acs-dingtalk-access-token: <token>`
   - Body: `{robotCode, userIds:[userid], msgKey:'sampleText', msgParam:'{"content":"..."}'}`
5) Success signal: response returns `processQueryKey`.
6) If user sees `#content#`: template override on DingTalk side; disable/replace template in admin console.

## Scripts
- `scripts/send_robot_private_by_name.js` (preferred for names): lookup userid automatically, then send message.
  ```bash
  node scripts/send_robot_private_by_name.js "徐晟" "测试消息"
  ```
- `scripts/send_robot_private.js`: send by userid directly (requires userid known).

## Notes
- `robotCode` default to `openclaw.json` `channels.dingtalk.robotCode` or fallback to appKey.
- Always resolve userid via `dingtalk-peopleinfo` skill first when name is given.
- If user not found: check spelling, try mobile number, or verify they're in the org.
