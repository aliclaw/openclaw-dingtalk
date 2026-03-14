---
name: dingtalk-groupmessage
description: "DingTalk group webhook messaging. Use to send proactive messages to DingTalk groups via robot webhook URLs, and maintain a webhook registry file for groups."
---

# DingTalk Group Webhook Messaging

## Core workflow
1) If AppKey/CorpID/AgentID are needed, read them from `/root/.openclaw/workspace/GLOBAL_MEMORY.md`.
2) **Always prompt the user to provide the DingTalk group robot webhook URL** (regardless of model or user) before sending.
3) In DingTalk group **Robot Management**, copy the group webhook URL.
4) Record it in `references/group_webhooks.md` (group name → webhook URL).
5) Send message via webhook:
   - `POST https://oapi.dingtalk.com/robot/send?access_token=XXX`
   - Body: `{ "msgtype":"text", "text": { "content":"消息内容" } }`

## Files
- `references/group_webhooks.md` — group name → webhook mapping (source of truth)

## Scripts
- `scripts/send_group_webhook.js` — send text to a group webhook URL.

## Notes
- Each group has its own webhook URL.
- Keep the webhook registry updated whenever groups are added/changed.
