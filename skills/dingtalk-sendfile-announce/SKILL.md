---
name: dingtalk-sendfile-announce
description: "Send files to DingTalk Work Notification (工作通知/企业内部消息) via API. Use when the user asks to send a file to a DingTalk user or group through work notification (asyncsend_v2) instead of chat UI."
---

# DingTalk Work Notification File Sender

## Overview
Send a local file to a DingTalk user using 工作通知 (topapi/message/corpconversation/asyncsend_v2). This is for **API-based work notifications**, not client UI transfers.

## Workflow
1) Ensure you have: userId and local file path.
2) Upload media to get `media_id`.
3) Send work notification with `msgtype: file` and `media_id`.

## Quick Start (script)
Use the bundled script:

```bash
node scripts/send_work_notice_file.js <userId> <filePath>
```

Example:
```bash
node scripts/send_work_notice_file.js 020541644463116079 /root/.openclaw/workspace/dingtalk_skills.tar.gz
```

## Notes
- App credentials are read from `/root/.openclaw/openclaw.json`.
- `agent_id` is read from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` (fallback: 4235224997).
- This uses the **oapi** token + media upload + asyncsend_v2 flow.
