#!/usr/bin/env node
/**
 * Query approval instances by process_code + time range (milliseconds)
 * Usage: node query_range_by_process.js <process_code> <start_ms> <end_ms>
 */

const cfg=require('/root/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const processCode=process.argv[2];
  const start=process.argv[3];
  const end=process.argv[4];
  if(!processCode||!start||!end){
    console.error('Usage: node query_range_by_process.js <process_code> <start_ms> <end_ms>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;

  let cursor=0,hasMore=true;const ids=[];
  while(hasMore){
    const res=await fetch(`https://oapi.dingtalk.com/topapi/processinstance/listids?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        process_code:processCode,
        start_time:String(start),
        end_time:String(end),
        size:20,
        cursor
      })
    });
    const json=await res.json();
    if(json.errcode!==0){
      console.error('listids errcode:', json.errcode, 'errmsg:', json.errmsg);
      process.exit(2);
    }
    const r=json.result||{};const list=r.list||[];
    for(const id of list) ids.push(id);
    hasMore=r.has_more;cursor=r.next_cursor||0;
  }

  const rows=[];
  for(const id of ids){
    const res=await fetch(`https://oapi.dingtalk.com/topapi/processinstance/get?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({process_instance_id:id})
    });
    const json=await res.json();
    if(json.errcode!==0){
      console.error('get errcode:', json.errcode, 'errmsg:', json.errmsg, 'id:', id);
      continue;
    }
    const r=json.process_instance||{};
    rows.push({
      id,
      title:r.title,
      status:r.status,
      originator:r.originator_userid,
      create_time:r.create_time
    });
  }
  console.log(JSON.stringify({process_code:processCode,count:rows.length,rows},null,2));
})();
