const cfg=require('/root/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const userid=process.argv[2];
  if(!userid){
    console.error('Usage: node list_process_by_user.js <userid>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;
  const res=await fetch(`https://oapi.dingtalk.com/topapi/process/listbyuserid?access_token=${token}` ,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({userid,offset:0,size:100})
  });
  const json=await res.json();
  const list=(json.result && json.result.process_list)||[];
  const rows=list.map(p=>({name:p.name,process_code:p.process_code}));
  console.log(JSON.stringify({count:rows.length,rows},null,2));
})();
