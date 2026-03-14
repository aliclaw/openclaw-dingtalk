#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const text = fs.readFileSync('/root/.openclaw/workspace/GLOBAL_MEMORY.md','utf8');
const appKey = (text.match(/App Key:\s*([^\n]+)/i)||[])[1]?.trim();
const appSecret = (text.match(/App Secret:\s*([^\n]+)/i)||[])[1]?.trim();
const [,, unionId, calendarId, eventId] = process.argv;

if(!unionId || !calendarId || !eventId){
  console.error('Usage: node delete_event.js <unionId> <calendarId> <eventId>');
  process.exit(1);
}

function getToken(cb){
  const data = JSON.stringify({appKey, appSecret});
  const req = https.request('https://api.dingtalk.com/v1.0/oauth2/accessToken', {method:'POST', headers:{'Content-Type':'application/json'}}, res=>{
    let body=''; res.on('data',d=>body+=d); res.on('end',()=>{try{cb(JSON.parse(body).accessToken);}catch(e){cb(null, body);}});
  });
  req.write(data); req.end();
}

function del(url, token, cb){
  const req = https.request(url,{method:'DELETE',headers:{'x-acs-dingtalk-access-token':token}},res=>{
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>cb(d));
  });
  req.end();
}

getToken((token, raw)=>{
  if(!token){console.error('token error', raw); return;}
  const url = `https://api.dingtalk.com/v1.0/calendar/users/${unionId}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  del(url, token, body=>{
    console.log(body || 'OK');
  });
});
