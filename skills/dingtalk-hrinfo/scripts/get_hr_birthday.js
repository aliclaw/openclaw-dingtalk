const fs = require('fs');
const path = require('path');

const GLOBAL_MEMORY = '/root/.openclaw/workspace/GLOBAL_MEMORY.md';

function parseConfig() {
  const text = fs.readFileSync(GLOBAL_MEMORY, 'utf8');
  const get = (label) => {
    const m = text.match(new RegExp(`${label}:\s*([^\n]+)`));
    return m ? m[1].trim() : null;
  };
  return {
    appKey: get('App Key') || get('AppKey') || get('App key'),
    appSecret: get('App Secret') || get('AppSecret') || get('App secret'),
    corpId: get('Corp ID') || get('CorpId') || get('CorpID'),
    agentId: Number(get('Agent ID') || get('AgentId') || get('AgentID')),
  };
}

async function getToken(appKey, appSecret) {
  const res = await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const json = await res.json();
  if (!json.access_token) throw new Error(`gettoken failed: ${JSON.stringify(json)}`);
  return json.access_token;
}

async function getBirthdayField(token, agentId) {
  const res = await fetch(`https://oapi.dingtalk.com/topapi/smartwork/hrm/roster/meta/get?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentid: agentId })
  });
  const json = await res.json();
  if (!json.result) throw new Error(`meta/get failed: ${JSON.stringify(json)}`);
  const fields = [];
  for (const g of json.result) {
    for (const f of (g.field_meta_info_list || [])) {
      if ((f.field_name || '').includes('生日') || (f.field_name || '').includes('出生')) {
        fields.push(f);
      }
    }
  }
  return fields;
}

async function getEmployeeFields(token, agentId, userid, fieldCodes) {
  const res = await fetch(`https://oapi.dingtalk.com/topapi/smartwork/hrm/employee/v2/list?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agentid: agentId,
      userid_list: userid,
      field_filter_list: fieldCodes.join(',')
    })
  });
  const json = await res.json();
  return json;
}

(async () => {
  const userid = process.argv[2];
  if (!userid) {
    console.error('Usage: node get_hr_birthday.js <userid>');
    process.exit(1);
  }
  const { appKey, appSecret, agentId } = parseConfig();
  if (!appKey || !appSecret || !agentId) {
    throw new Error('Missing App Key/App Secret/Agent ID in GLOBAL_MEMORY.md');
  }
  const token = await getToken(appKey, appSecret);
  const fields = await getBirthdayField(token, agentId);
  const codes = fields.map(f => f.field_code);
  const data = await getEmployeeFields(token, agentId, userid, codes);
  console.log(JSON.stringify({ fields, data }, null, 2));
})();
