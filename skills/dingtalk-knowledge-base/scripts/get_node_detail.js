#!/usr/bin/env node
/**
 * Get Node Detail
 * 获取节点详情
 * Usage: node scripts/get_node_detail.js <nodeId>
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

function formatSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  const config = getConfig();
  const nodeId = process.argv[2];

  if (!nodeId) {
    console.log('❌ 用法: node scripts/get_node_detail.js <nodeId>');
    process.exit(1);
  }

  const token = await getAccessToken(config.appKey, config.appSecret);
  const url = `https://api.dingtalk.com/v2.0/wiki/nodes/${nodeId}?operatorId=${config.unionId}`;

  https.get(url, { headers: { 'x-acs-dingtalk-access-token': token } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.code) { console.log('❌', json.message); return; }

      const node = json.node;
      if (!node) { console.log('❌ 节点不存在'); return; }

      const icon = node.type === 'FOLDER' ? '📁' : '📄';
      console.log(`${icon} ${node.name}\n`);
      console.log(`ID:         ${node.nodeId}`);
      console.log(`Workspace:  ${node.workspaceId}`);
      console.log(`Type:       ${node.type}`);
      console.log(`Category:   ${node.category || '-'}`);
      if (node.size) console.log(`Size:       ${formatSize(node.size)}`);
      console.log(`HasChild:   ${node.hasChildren}`);
      console.log(`URL:        ${node.url}`);
      console.log(`Created:    ${node.createTime}`);
      console.log(`Modified:   ${node.modifiedTime}`);
      if (node.permissionRole) console.log(`Permission: ${node.permissionRole}`);
    });
  }).on('error', e => console.log('❌', e.message));
}

main();
