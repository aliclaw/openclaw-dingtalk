#!/usr/bin/env node
/**
 * List DingTalk Knowledge Base Workspaces
 * 获取知识库列表
 */

const https = require('https');
const fs = require('fs');

const CONFIG_PATH = '/root/.openclaw/workspace/GLOBAL_MEMORY.md';

function getConfig() {
  const content = fs.readFileSync(CONFIG_PATH, 'utf8');
  return {
    appKey: content.match(/[-]?\s*App Key:\s*([^\n]+)/i)?.[1]?.trim(),
    appSecret: content.match(/[-]?\s*App Secret:\s*([^\n]+)/i)?.[1]?.trim(),
    unionId: content.match(/unionId:\s*([^\n]+)/)?.[1]?.trim()
  };
}

async function getAccessToken(appKey, appSecret) {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          json.errcode === 0 ? resolve(json.access_token) : reject(new Error(json.errmsg));
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const config = getConfig();
  if (!config.appKey || !config.unionId) {
    console.log('❌ 配置缺失: App Key或unionId');
    process.exit(1);
  }

  const token = await getAccessToken(config.appKey, config.appSecret);
  const url = `https://api.dingtalk.com/v2.0/wiki/workspaces?operatorId=${config.unionId}&maxResults=100`;

  https.get(url, { headers: { 'x-acs-dingtalk-access-token': token } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.code) { console.log('❌', json.message); return; }
      
      console.log(`✅ 知识库列表 (${json.workspaces.length}个)\n`);
      json.workspaces.forEach((ws, i) => {
        console.log(`${i+1}. ${ws.name}`);
        console.log(`   ID: ${ws.workspaceId}`);
        console.log(`   Root: ${ws.rootNodeId}`);
        console.log(`   URL: ${ws.url}\n`);
      });
    });
  }).on('error', e => console.log('❌', e.message));
}

main();
