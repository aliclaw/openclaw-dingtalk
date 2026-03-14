---
name: dingtalk-knowledge-base
description: "DingTalk 知识库(Wiki)查询与管理。支持获取知识库列表、获取节点列表（文档/文件夹结构）、获取节点详情。注意：文档内容读取需要特定权限或手动下载；知识库文档 ≠ 钉盘文件，需区分使用。"
---

# DingTalk Knowledge Base

## Quick Start

1. **获取token**：`scripts/get_token.js`（自动从GLOBAL_MEMORY.md读取配置）
2. **查知识库**：`scripts/list_workspaces.js`
3. **查节点**：`scripts/list_nodes.js <parentNodeId>`
4. **查详情**：`scripts/get_node_detail.js <nodeId>`
5. **探索结构**：`bash scripts/explore.sh <workspaceId> <rootNodeId>`

## 接口方法与参数（必须）
- **GET /v2.0/wiki/workspaces?operatorId={unionId}**
  - `operatorId` 是 **query 参数**，**不要放在 body**。
  - **必须是 unionId（不是 userid）**。
- **GET /v2.0/wiki/nodes?parentNodeId=...&operatorId=...**
- **GET /v2.0/wiki/nodes/{nodeId}?operatorId=...**

## 正确 / 错误示例对比
**正确 ✅**
```
GET /v2.0/wiki/workspaces?operatorId=UNION_ID
```

**错误 ❌**
```
POST /v2.0/wiki/workspaces/batchQuery
```

**错误 ❌**
```
POST /v2.0/wiki/workspaces
{
  "operatorId": "UNION_ID"
}
```

## 关键提醒
- `operatorId` 必须是 **unionId**，不要用 userid。
- Wiki 接口是 **GET**，不是 POST。
- 参数放在 **query**，不要放 body。

## 常见错误排查
| 错误现象 | 可能原因 | 解决方式 |
| --- | --- | --- |
| `InvalidVersion` | 接口路径版本不对 | 用 **/v2.0/wiki/** 开头的路径 |
| `api not found` | 调用了不存在的路径 | 用 **GET /v2.0/wiki/workspaces** |
| 返回空/无权限 | operatorId 错或权限缺失 | 确认 **unionId** + 授权范围 |
| 一直报错 | token获取方式错误 | 用 **v1.0 oauth2 accessToken** + `x-acs-dingtalk-access-token` |

## API Reference

### GET /v2.0/wiki/workspaces
- 功能：获取知识库列表
- 参数：`operatorId` (unionId), `maxResults`, `orderBy`
- 返回：`workspaces[]` (workspaceId, rootNodeId, name, url等)

### GET /v2.0/wiki/nodes
- 功能：获取节点列表（文档/文件夹）
- 参数：`parentNodeId` (必填), `operatorId` (必填), `maxResults`, `nextToken`
- 返回：`nodes[]` (nodeId, name, type, hasChildren, size, url)

### GET /v2.0/wiki/nodes/:nodeId
- 功能：获取节点详情
- 参数：`operatorId`
- 返回：单个节点完整信息（包含permissionRole）

## Scripts

| Script | Description |
|--------|-------------|
| `scripts/list_workspaces.js` | 获取知识库列表 |
| `scripts/list_nodes.js` | 获取节点列表 |
| `scripts/get_node_detail.js` | 获取节点详情 |
| `scripts/explore.sh` | 递归探索知识库完整结构 |

## Limitations

- 文档内容读取需要特定权限
- 知识库文档 ≠ 钉盘文件
- 下载文件需要额外API权限

## Configuration

读取 `/root/.openclaw/workspace/GLOBAL_MEMORY.md` 中的：
- App Key
- App Secret
- unionId
