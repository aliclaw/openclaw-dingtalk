#!/usr/bin/env node
/**
 * List Knowledge Base Nodes
 * 获取节点列表
 * Usage: node scripts/list_nodes.js <parentNodeId> [maxResults]
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
  const parentNodeId = process.argv[2];
  const maxResults = process.argv[3] || 50;

  if (!parentNodeId) {
    console.log('❌ 用法: node scripts/list_nodes.js <parentNodeId> [maxResults]');
    process.exit(1);
  }

  const token = await getAccessToken(config.appKey, config.appSecret);
  const url = `https://api.dingtalk.com/v2.0/wiki/nodes?parentNodeId=${parentNodeId}&maxResults=${maxResults}&operatorId=${config.unionId}`;

  https.get(url, { headers: { 'x-acs-dingtalk-access-token': token } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.code) { console.log('❌', json.message); return; }

      const nodes = json.nodes || [];
      console.log(`✅ 节点列表 (${nodes.length}个)\n`);
      nodes.forEach((node, i) => {
        const icon = node.type === 'FOLDER' ? '📁' : '📄';
        console.log(`${icon} ${i+1}. ${node.name}`);
        console.log(`   ID: ${node.nodeId}`);
        console.log(`   Type: ${node.type}${node.size ? ' | ' + formatSize(node.size) : ''}`);
        console.log(`   URL: ${node.url}\n`);
      });
    });
  }).on('error', e => console.log('❌', e.message));
}

main();
