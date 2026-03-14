const axios = require('axios');
const fs = require('fs');

const cfg = require('/root/.openclaw/openclaw.json');
const appKey = cfg.channels.dingtalk.clientId;
const appSecret = cfg.channels.dingtalk.clientSecret;

const GLOBAL_MEMORY_PATH = '/root/.openclaw/workspace/GLOBAL_MEMORY.md';
let agentId = 4235224997;
try {
  const gm = fs.readFileSync(GLOBAL_MEMORY_PATH, 'utf8');
  const m = gm.match(/Agent ID:\s*(\d+)/);
  if (m) agentId = parseInt(m[1], 10);
} catch (_) {}

const userId = process.argv[2];
const message = process.argv.slice(3).join(' ');
if (!userId || !message) {
  console.error('Usage: node send_work_notice_text.js <userId> <message>');
  process.exit(1);
}

(async () => {
  const tokenRes = await axios.get(
    `https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`
  );
  if (tokenRes.data.errcode !== 0) {
    throw new Error('gettoken failed: ' + JSON.stringify(tokenRes.data));
  }
  const token = tokenRes.data.access_token;

  const sendUrl = `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${token}`;
  const body = {
    agent_id: agentId,
    userid_list: userId,
    msg: { msgtype: 'text', text: { content: message } }
  };
  const sendRes = await axios.post(sendUrl, body);
  console.log('sendRes', sendRes.data);
})().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});
