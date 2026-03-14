# DingTalk Project Task API Reference (v1.0)

> 仅列已验证的项目管理/任务接口（项目管理 Teambition）。

## 认证
- `POST https://api.dingtalk.com/v1.0/oauth2/accessToken`
  - body: `{ appKey, appSecret }`
  - 返回：`accessToken`

## 项目
- **查询项目**
  - `POST /v1.0/project/users/{userId}/projects/query?maxResults=...&nextToken=...&name=...`

## 任务列表/详情
- **查询任务列表**（基于用户）
  - `POST /v1.0/project/users/{userId}/tasks/search?roleTypes=creator,executor,involveMember&maxResults=...`
  - 结果中按 `projectId` 过滤
- **任务详情**
  - `GET /v1.0/project/users/{userId}/tasks?taskId={taskId}`

## 任务分组/阶段
- **任务分组（taskList）**
  - `POST /v1.0/project/users/{userId}/projects/{projectId}/taskLists/search?maxResults=...`
- **任务阶段（taskStage）**
  - `POST /v1.0/project/users/{userId}/projects/{projectId}/taskStages/search?maxResults=...`

## 任务更新
- **更新执行者**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/executors`
  - body: `{ executorId }`
- **更新参与人**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/involveMembers`
  - body: `{ involveMembers: [userId,...] }`
- **更新内容**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/contents`
  - body: `{ content }`
- **更新备注**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/notes`
  - body: `{ note }`
- **更新优先级**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/priorities`
  - body: `{ priority }`
  - 常见值：`-10 / 0 / 2`（从任务数据验证）
- **更新工作流状态**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/taskflowStatuses`
  - body: `{ taskflowStatusId }`

## 任务创建
- **创建任务**
  - `POST /v1.0/project/users/{userId}/tasks`
  - body: `{ projectId, content, executorId?, dueDate?, note?, priority?, stageId?, parentTaskId?, customfields? }`

## 工作流状态检索
- **查询项目内工作流状态**
  - `GET /v1.0/project/users/{userId}/projects/{projectId}/taskflowStatuses/search?maxResults=...`

## 自定义字段
- **查询项目自定义字段**
  - `POST /v1.0/project/users/{userId}/projects/{projectId}/customfields/search?maxResults=...`
- **更新任务自定义字段**
  - `PUT /v1.0/project/users/{userId}/tasks/{taskId}/customFields`
  - 单字段 body 示例：`{ customFieldId, customFieldName, value: [{ title: "..." }] }`
  - 注意：单次提交一个字段更稳定
