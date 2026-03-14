const cfg=require('/root/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const id=process.argv[2];
  if(!id){
    console.error('Usage: node get_instance.js <process_instance_id>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;
  const res=await fetch(`https://oapi.dingtalk.com/topapi/processinstance/get?access_token=${token}` ,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({process_instance_id:id})
  });
  const json=await res.json();
  console.log(JSON.stringify(json,null,2));
})();
