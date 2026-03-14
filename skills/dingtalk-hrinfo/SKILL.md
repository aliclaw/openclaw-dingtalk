---
name: dingtalk-hrinfo
description: "DingTalk 智能人事/人事档案(花名册)查询与字段拉取。用于获取员工人事档案字段（如生日/入职/证件等），先读 GLOBAL_MEMORY.md 中的 App Key/App Secret/Corp ID/Agent ID，再调用花名册元数据与员工字段接口。"
---

# DingTalk HR Info (人事档案/花名册)

## Quick workflow
1) **读取配置**：从 `/root/.openclaw/workspace/GLOBAL_MEMORY.md` 取 App Key/App Secret/Corp ID/Agent ID。
2) **拿 token**：`https://oapi.dingtalk.com/gettoken`。
3) **查字段元数据**：`POST /topapi/smartwork/hrm/roster/meta/get`（body: `{agentid}`）获取 field_code。
4) **查员工字段值**：`POST /topapi/smartwork/hrm/employee/v2/list`（body: `{agentid, field_filter_list}`）。

## 生日字段说明
- **出生日期字段**：`sys02-birthTime`（字段名称：出生日期，位于"个人信息"分组）
- **格式**：`YYYY-MM-DD` 或 `MM-DD`

## Scripts

### 查询员工生日
```bash
# 方法1: 使用dingtalk-hrinfo skill的脚本
cd /root/.openclaw/workspace/skills/dingtalk-hrinfo
node scripts/query_birthday_by_userid.js <userid>

# 方法2: 手动调用API
node scripts/query_employee_birthday.js
```

### 查询所有员工生日
```bash
cd /root/.openclaw/workspace/skills/dingtalk-hrinfo
node scripts/list_all_birthdays.js
```

### 筛选今天过生日的员工
```bash
cd /root/.openclaw/workspace/skills/dingtalk-hrinfo
node scripts/today_birthdays.js
```

## API调用示例

### 1. 获取access_token
```bash
curl "https://oapi.dingtalk.com/gettoken?appkey=<AppKey>&appsecret=<AppSecret>"
```

### 2. 查询员工生日（指定userid）
```bash
curl -X POST "https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list?access_token=<token>" \
  -H "Content-Type: application/json" \
  -d '{
    "agentid": <AgentId>,
    "field_filter_list": ["sys02-birthTime", "姓名"]
  }'
```

### 3. 查询所有员工生日（批量）
```bash
# 注意：userid_list参数暂不支持空字符串，需通过部门查询
# 先获取部门ID，再查询部门员工
```

## 常用生日查询场景

### 场景1：查询特定员工生日
```javascript
// Node.js示例
const https = require('https');
const accessToken = '<token>';
const userId = '020541644463116079'; // 徐晟

const data = JSON.stringify({
  agentid: 4235224997,
  field_filter_list: ['sys02-birthTime']
});

const req = https.request('https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list?access_token=' + accessToken, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const json = JSON.parse(body);
    if (json.errcode === 0) {
      const employee = json.data.list.find(e => e.userid === userId);
      if (employee) {
        const birthday = employee.field_list?.find(f => f.field_code === 'sys02-birthTime');
        console.log('生日:', birthday?.value);
      }
    }
  });
});
req.write(data);
req.end();
```

### 场景2：查询所有员工并筛选今天生日
```javascript
const https = require('https');
const https = require('https');
const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();

// 查询所有员工生日...
// 筛选条件：field.value 匹配 MM-DD 格式
```

### 场景3：发送生日祝福（通过机器人）
```javascript
const https = require('https');
const robotUrl = 'https://oapi.dingtalk.com/robot/send?access_token=<robot_token>';
const message = '🎂 祝**张三**生日快乐！';

const body = JSON.stringify({
  msgtype: 'text',
  text: { content: message }
});

const req = https.request(robotUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  // 处理响应...
});
req.write(body);
req.end();
```

## Update (写入)
- 接口：`POST /topapi/smartwork/hrm/employee/v2/update`
- Body 结构：
  ```json
  {
    "agentid": "<AgentId>",
    "param": {
      "userid": "<userid>",
      "groups": [
        {
          "group_id": "sys02",
          "sections": [
            {
              "old_index": 0,
              "section": [
                {"field_code": "sys02-birthTime", "value": "1988-01-01"}
              ]
            }
          ]
        }
      ]
    }
  }
  ```
- 需要权限：`qyapi_hrm_manager`

## Notes
- 查询时必须实时调用钉钉花名册接口（不要从本地缓存文件读取）。
- 如果返回空字段：检查字段是否在花名册启用、权限是否开通、是否对应用可见。
- 读接口权限：`qyapi_hrm_read_user`。
- 写接口权限：`qyapi_hrm_manager`。
- **生日字段code**：`sys02-birthTime`（系统字段，非自定义）
