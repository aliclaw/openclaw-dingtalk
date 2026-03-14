---
name: dingtalk-project-task
description: DingTalk 项目管理(Teambition)项目与任务的查询/更新/创建能力（项目列表、任务列表、任务详情、父子任务、执行者/参与人/内容/备注/截止时间/优先级/工作流状态/自定义字段等）。当需要通过钉钉开放平台 API 读写项目任务时使用。
---

# DingTalk Project Task

使用本技能完成钉钉项目管理（Teambition）项目与任务的读取、更新与创建。

## 读取配置
- 从 `/root/.openclaw/workspace/GLOBAL_MEMORY.md` 读取 App Key / App Secret
- token：`POST https://api.dingtalk.com/v1.0/oauth2/accessToken`

## 常用流程（优先用）
1) 列项目 → 取得 projectId
2) 列任务 → 过滤指定 projectId
3) 查任务详情 → 读取负责人/参与人/截止日期/自定义字段
4) 按需更新（执行者/参与人/内容/备注/截止时间/优先级/工作流状态/自定义字段）

## 参考接口
接口清单见：`references/api_reference.md`

## 规范
- 所有写操作先确认用户目标与具体任务（taskId）。
- 更新接口返回 204/空消息视为成功。
- 任务字段名称以接口响应为准（executorId, involveMembers, dueDate, taskflowStatusId, customFields/customfields）。
