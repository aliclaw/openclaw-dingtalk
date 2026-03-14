---
name: dingtalk-sendfiletogroup
description: "Get DingTalk group openConversationId via dingtalk-monitorstream (Stream sessions), then send a file to that group using robot groupMessages/send. Use when the user wants to send a file to a group but only has a trigger message in the group."
---

# DingTalk: Get Group ID (Stream) → Send File to Group

## Overview
Two-step workflow: (1) read Stream session to obtain `openConversationId`, (2) upload media and send file to the group.

## Workflow
1) **If the user’s request comes from a DingTalk group chat**: extract the `openConversationId` directly from the current session key (format: `agent:main:dingtalk:group:<openConversationId>`). Use `sessions_list(limit=10, messageLimit=1)` and match the current session to avoid asking for a trigger.
2) Otherwise, ask the user to @mention the bot in the target group and send a short trigger message (e.g., “获取群ID”).
3) Use **dingtalk-monitorstream** to locate the latest group session and extract `openConversationId`.
4) Upload file to get `media_id`.
5) Send file via groupMessages API with **camelCase** `mediaId/fileName`.

## Commands (examples)
- Get openConversationId:
```bash
# via tool: sessions_list(limit=10, messageLimit=1)
# find: agent:main:dingtalk:group:<openConversationId>
```
- Send file (script below):
```bash
node scripts/send_group_file.js <openConversationId> <filePath>
```

## Notes
- Token: `POST https://api.dingtalk.com/v1.0/oauth2/accessToken`
- Upload: `POST https://oapi.dingtalk.com/media/upload?access_token=...&type=file`
- Group send: `POST https://api.dingtalk.com/v1.0/robot/groupMessages/send`
- `msgKey = "sampleFile"`, `msgParam = {"mediaId":"...","fileName":"..."}`
- Webhook URLs cannot send files.
