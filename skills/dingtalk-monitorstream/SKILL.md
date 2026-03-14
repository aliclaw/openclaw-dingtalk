---
name: dingtalk-monitorstream
description: "Monitor DingTalk Stream mode by reading live session updates and recent messages. Use when debugging whether Stream events are arriving, verifying group/private sessions, or extracting metadata like openConversationId from session records."
---

# DingTalk Stream Monitor

## Overview
Verify Stream-mode ingestion by checking recent DingTalk sessions and their latest messages.

## Workflow
1) Read callback URL from `/root/.openclaw/workspace/GLOBAL_MEMORY.md` (do not hardcode in this skill).
2) Use `sessions_list` to see recent DingTalk sessions (group/private) and identify active ones.
3) Use `sessions_history` on the target session key to inspect incoming messages.
4) Confirm metadata such as `openConversationId` in the session key or delivery context.

## Commands (examples)
```bash
# via tool: sessions_list(limit=10, messageLimit=1)
# via tool: sessions_history(sessionKey, limit=5)
```

## Notes
- For Stream mode session reads, ensure callback domain is prepared per GLOBAL_MEMORY (Let’s Encrypt certificate + Nginx). 
- If you only see private sessions, the bot wasn’t mentioned in the group.
