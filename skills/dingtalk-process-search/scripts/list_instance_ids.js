const cfg=require('/root/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const processCode=process.argv[2];
  const start=process.argv[3];
  const end=process.argv[4];
  if(!processCode||!start||!end){
    console.error('Usage: node list_instance_ids.js <process_code> <start_ms> <end_ms>');
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
      body: JSON.stringify({process_code:processCode,start_time:Number(start),end_time:Number(end),size:10,cursor})
    });
    const json=await res.json();
    const r=json.result||{};const list=r.list||[];
    for(const id of list) ids.push(id);
    hasMore=r.has_more;cursor=r.next_cursor||0;
  }
  console.log(JSON.stringify({count:ids.length,ids},null,2));
})();
