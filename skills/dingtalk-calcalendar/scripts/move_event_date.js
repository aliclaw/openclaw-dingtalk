#!/usr/bin/env node
const https = require('https');
const fs = require('fs');

const text = fs.readFileSync('/root/.openclaw/workspace/GLOBAL_MEMORY.md','utf8');
const appKey = (text.match(/App Key:\s*([^\n]+)/i)||[])[1]?.trim();
const appSecret = (text.match(/App Secret:\s*([^\n]+)/i)||[])[1]?.trim();
const [,, unionId, calendarId, eventId, targetDate, timeZone='Asia/Shanghai'] = process.argv;

if(!unionId || !calendarId || !eventId || !targetDate){
  console.error('Usage: node move_event_date.js <unionId> <calendarId> <eventId> <YYYY-MM-DD> [timeZone]');
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

function put(url, token, payload, cb){
  const req = https.request(url,{method:'PUT',headers:{'Content-Type':'application/json','x-acs-dingtalk-access-token':token}},res=>{
    let d=''; res.on('data',c=>d+=c); res.on('end',()=>cb(d));
  });
  req.write(JSON.stringify(payload)); req.end();
}

function replaceDate(dateTime, newDate){
  // Keep time portion (HH:mm:ss and offset) as-is
  const m = dateTime.match(/T(\d{2}:\d{2}:\d{2}(?:\.\d+)?)([+-]\d{2}:\d{2}|Z)$/);
  if(!m) return null;
  return `${newDate}T${m[1]}${m[2]}`;
}

getToken((token, raw)=>{
  if(!token){console.error('token error', raw); return;}
  const getUrl = `https://api.dingtalk.com/v1.0/calendar/users/${unionId}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
  get(getUrl, token, body=>{
    let ev;
    try{ ev = JSON.parse(body); }catch(e){ console.error('parse error', body); return; }
    const startDt = ev.start?.dateTime;
    const endDt = ev.end?.dateTime;
    if(!startDt || !endDt){
      console.error('missing dateTime in event');
      return;
    }
    const newStart = replaceDate(startDt, targetDate);
    const newEnd = replaceDate(endDt, targetDate);
    if(!newStart || !newEnd){
      console.error('failed to replace date');
      return;
    }
    const payload = { id: eventId, start: { dateTime: newStart, timeZone }, end: { dateTime: newEnd, timeZone } };
    const putUrl = `https://api.dingtalk.com/v1.0/calendar/users/${unionId}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    put(putUrl, token, payload, resp=>{
      console.log(resp || 'OK');
    });
  });
});
