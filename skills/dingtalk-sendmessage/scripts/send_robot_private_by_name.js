const cfg=require('/home/admin/.openclaw/openclaw.json');

(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const robotCode=cfg.channels.dingtalk.robotCode||appKey;
  const name=process.argv[2];
  const content=process.argv.slice(3).join(' ');
  if(!name||!content){
    console.error('Usage: node send_robot_private_by_name.js <name> <content>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;

  // build user list (peopleinfo flow)
  const deptIds=[1];
  for(let i=0;i<deptIds.length;i++){
    const id=deptIds[i];
    const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/department/listsubid?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({dept_id:id})
    });
    const json=await res.json();
    const list=(json.result && json.result.dept_id_list)||[];
    for(const d of list){ if(!deptIds.includes(d)) deptIds.push(d); }
  }
  const users=[];
  const seen=new Set();
  for(const deptId of deptIds){
    let cursor=0,hasMore=true;
    while(hasMore){
      const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/user/list?access_token=${token}` ,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({dept_id:deptId,cursor,size:100})
      });
      const json=await res.json();
      const result=json.result||{};
      const list=result.list||[];
      for(const u of list){
        if(!seen.has(u.userid)){
          seen.add(u.userid);
          users.push({userid:u.userid,name:u.name});
        }
      }
      hasMore=result.has_more;cursor=result.next_cursor||0;
    }
  }

  const matches=users.filter(u=>u.name===name);
  if(matches.length===0){
    console.error(`No user found for name: ${name}`);
    process.exit(2);
  }
  if(matches.length>1){
    console.error(`Multiple users found for name: ${name}: ${matches.map(m=>m.userid).join(', ')}`);
    process.exit(3);
  }
  const userId=matches[0].userid;

  // send message via robot
  const token2Res=await fetch('https://api.dingtalk.com/v1.0/oauth2/accessToken',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({appKey,appSecret})
  });
  const token2Json=await token2Res.json();
  const accessToken=token2Json.accessToken;
  const body={robotCode,userIds:[userId],msgKey:'sampleText',msgParam: JSON.stringify({content})};
  const res2=await fetch('https://api.dingtalk.com/v1.0/robot/oToMessages/batchSend',{
    method:'POST',
    headers:{'Content-Type':'application/json','x-acs-dingtalk-access-token':accessToken},
    body: JSON.stringify(body)
  });
  const json2=await res2.json();
  console.log(JSON.stringify({userId,sendResult:json2},null,2));
})();
