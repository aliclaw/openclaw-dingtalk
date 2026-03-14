const cfg=require('/root/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const robotCode=cfg.channels.dingtalk.robotCode||appKey;
  const userId=process.argv[2];
  const content=process.argv.slice(3).join(' ');
  if(!userId||!content){
    console.error('Usage: node send_robot_private.js <userid> <content>');
    process.exit(1);
  }
  const tokenRes=await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({appKey,appSecret})
  });
  const tokenJson=await tokenRes.json();
  const accessToken=tokenJson.accessToken;
  const body={robotCode,userIds:[userId],msgKey:'sampleText',msgParam: JSON.stringify({content})};
  const res=await fetch('https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-acs-dingtalk-access-token':accessToken},
    body: JSON.stringify(body)
  });
  const json=await res.json();
  console.log(JSON.stringify(json,null,2));
})();
