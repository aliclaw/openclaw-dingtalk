---
name: dingtalk-sendfile-chat
description: "Send files to DingTalk private chat via robot oToMessages/batchSend (sampleFile). Use when the user wants to send a file in a 1:1 chat through the DingTalk API."
---

# DingTalk Private Chat File Sender

## Overview
Send a local file to a DingTalk user in a private chat using **robot oToMessages/batchSend** with `sampleFile`.

## Workflow
1) Ensure you have: userId and local file path.
2) Upload media to get `media_id`.
3) Send private chat file using:
   - `msgKey: "sampleFile"`
   - `msgParam` **camelCase**: `{ "mediaId": "...", "fileName": "..." }`

## Quick Start (script)
Use the bundled script:

```bash
node scripts/send_chat_file.js <userId> <filePath>
```

Example:
```bash
node scripts/send_chat_file.js 020541644463116079 /root/.openclaw/workspace/dingtalk_skills.tar.gz
```

## Notes
- App credentials are read from `/root/.openclaw/openclaw.json`.
- Must use **camelCase** in `msgParam` (`mediaId`/`fileName`). Using `media_id`/`file_name` will fail.
- Token is from `https://api.dingtalk.com/v1.0/oauth2/accessToken`; upload is via `oapi.dingtalk.com/media/upload`.
