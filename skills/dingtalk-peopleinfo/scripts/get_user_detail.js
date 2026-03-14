const cfg=require('/root/.openclaw/openclaw.json');
(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const userid=process.argv[2];
  if(!userid){
    console.error('Usage: node get_user_detail.js <userid>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;
  const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${token}` ,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({userid})
  });
  const json=await res.json();
  console.log(JSON.stringify(json,null,2));
})();
