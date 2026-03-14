#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const text = fs.readFileSync('/root/.openclaw/workspace/GLOBAL_MEMORY.md','utf8');
const appKey = (text.match(/App Key:\s*([^\n]+)/i)||[])[1]?.trim();
const appSecret = (text.match(/App Secret:\s*([^\n]+)/i)||[])[1]?.trim();
const [,, unionId, calendarId, eventId, startDateTime, endDateTime, timeZone='Asia/Shanghai'] = process.argv;

if(!unionId || !calendarId || !eventId || !startDateTime || !endDateTime){
  console.error('Usage: node update_event_time.js <unionId> <calendarId> <eventId> <startDateTime ISO> <endDateTime ISO> [timeZone]');
  process.exit(1);
}

function getToken(cb){
  const data = JSON.stringify({appKey, appSecret});
  const req = https.request('https://api.dingtalk.com/v1.0/oauth2/accessToken', {method:'POST', headers:{'Content-Type':'application/json'}}, res=>{
    let body=''; res.on('data',d=>body+=d); res.on('end',()=>{try{cb(JSON.parse(body).accessToken);}catch(e){cb(null, body);}});
  });
  req.write(data); req.end();
}

function put(url, token, payload, cb){
  const req = https.request(url,{method:'PUT',headers:{'Content-Type':'application/json','x-acs-dingtalk-access-token':token}},res=>{
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>cb(d));
  });
  req.write(JSON.stringify(payload)); req.end();
}

const payload = {
  id: eventId,
  start: { dateTime: startDateTime, timeZone },
  end:   { dateTime: endDateTime, timeZone }
};

getToken((token, raw)=>{
  if(!token){console.error('token error', raw); return;}
  const url = `https://api.dingtalk.com/v1.0/calendar/users/${unionId}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  put(url, token, payload, body=>{
    console.log(body || 'OK');
  });
});
