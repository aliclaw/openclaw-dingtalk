const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

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
const filePath = process.argv[3];
if (!userId || !filePath) {
  console.error('Usage: node send_work_notice_file.js <userId> <filePath>');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

(async () => {
  // get access_token (oapi)
  const tokenRes = await axios.get(
    `https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`
  );
  if (tokenRes.data.errcode !== 0) {
    throw new Error('gettoken failed: ' + JSON.stringify(tokenRes.data));
  }
  const token = tokenRes.data.access_token;

  // upload media
  const form = new FormData();
  form.append('media', fs.createReadStream(filePath));
  const uploadUrl = `https://oapi.dingtalk.com/media/upload?access_token=${token}&type=file`;
  const uploadRes = await axios.post(uploadUrl, form, { headers: form.getHeaders() });
  if (uploadRes.data.errcode !== 0) {
    throw new Error('upload failed: ' + JSON.stringify(uploadRes.data));
  }
  const mediaId = uploadRes.data.media_id;

  // async send work notification
  const sendUrl = `https://oapi.dingtalk.com/topapi/message/corpconversation/asyncsend_v2?access_token=${token}`;
  const body = {
    agent_id: agentId,
    userid_list: userId,
    msg: { msgtype: 'file', file: { media_id: mediaId } }
  };
  const sendRes = await axios.post(sendUrl, body);

  console.log('uploadRes', uploadRes.data);
  console.log('sendRes', sendRes.data);
})().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});
