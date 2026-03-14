---
name: dingtalk-sendtoannounce
description: "Send DingTalk Work Notification (工作通知/企业内部消息) text messages via API (asyncsend_v2). Use when the user wants to push a text notification to a DingTalk user through work notification instead of chat UI."
---

# DingTalk Work Notification Text Sender

## Overview
Send a text notification to a DingTalk user using 工作通知 (`topapi/message/corpconversation/asyncsend_v2`).

## Workflow
1) Ensure you have: userId and message content.
2) Send work notification with `msgtype: text`.

## Quick Start (script)
```bash
node scripts/send_work_notice_text.js <userId> <message>
```

Example:
```bash
node scripts/send_work_notice_text.js 020541644463116079 "测试通知"
```

## Notes
- App credentials are read from `/root/.openclaw/openclaw.json`.
- `agent_id` is read from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` (fallback: 4235224997).
- Uses oapi token + asyncsend_v2.
