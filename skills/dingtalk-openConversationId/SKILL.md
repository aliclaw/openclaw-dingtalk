---
name: dingtalk-openconversationid
description: "Get DingTalk group openConversationId via Stream mode session messages. Use when the user asks for group ID retrieval by @mentioning the bot in a group and reading the session metadata/history."
---

# DingTalk openConversationId (Stream)

## Overview
Obtain a group’s `openConversationId` by reading Stream-mode session records after the bot is mentioned in a group.

## Workflow
1) Ask user to @mention the bot in the target group and send a short trigger message (e.g., “获取群ID”).
2) List sessions and locate the newest **DingTalk group** session.
3) Extract `openConversationId` from the session key or delivery context (`to`).

## Commands (examples)
List recent sessions:
```bash
# via tool: sessions_list(limit=10, messageLimit=1)
```
Look for keys like:
```
agent:main:dingtalk:group:<openConversationId>
```

## Notes
- Stream mode does **not** require HTTP callback URL/Token/AESKey.
- If no new group session appears, the bot was likely not mentioned in the group.
