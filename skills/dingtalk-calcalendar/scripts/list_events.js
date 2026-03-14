#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const text = fs.readFileSync('/root/.openclaw/workspace/GLOBAL_MEMORY.md','utf8');
const appKey = (text.match(/App Key:\s*([^\n]+)/i)||[])[1]?.trim();
const appSecret = (text.match(/App Secret:\s*([^\n]+)/i)||[])[1]?.trim();
const [,, unionId, calendarId, startTime, endTime] = process.argv;

if(!unionId || !calendarId || !startTime || !endTime){
  console.error('Usage: node list_events.js <unionId> <calendarId> <startTime ISO> <endTime ISO>');
  process.exit(1);
}

function getToken(cb){
  const data = JSON.stringify({appKey, appSecret});
  const req = https.request('https://api.dingtalk.com/v1.0/oauth2/accessToken', {method:'POST', headers:{'Content-Type':'application/json'}}, res=>{
    let body=''; res.on('data',d=>body+=d); res.on('end',()=>{try{cb(JSON.parse(body).accessToken);}catch(e){cb(null, body);}});
  });
  req.write(data); req.end();
}

function get(url, token, cb){
  https.get(url, {headers:{'x-acs-dingtalk-access-token':token}}, res=>{
    let body=''; res.on('data',d=>body+=d); res.on('end',()=>cb(body));
  });
}

getToken((token, raw)=>{
  if(!token){console.error('token error', raw); return;}
  const url = `https://api.dingtalk.com/v1.0/calendar/users/${unionId}/calendars/${encodeURIComponent(calendarId)}/events?startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
  get(url, token, body=>{
    console.log(body);
  });
});
