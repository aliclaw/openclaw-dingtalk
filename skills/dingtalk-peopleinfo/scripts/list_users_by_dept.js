const cfg=require('/root/.openclaw/openclaw.json');
(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const deptId=process.argv[2];
  if(!deptId){
    console.error('Usage: node list_users_by_dept.js <dept_id>');
    process.exit(1);
  }
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;
  let cursor=0,hasMore=true;const listAll=[];
  while(hasMore){
    const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/user/list?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({dept_id:Number(deptId),cursor,size:100})
    });
    const json=await res.json();
    const result=json.result||{};
    const list=result.list||[];
    listAll.push(...list);
    hasMore=result.has_more;cursor=result.next_cursor||0;
  }
  console.log(JSON.stringify({dept_id:Number(deptId),count:listAll.length,users:listAll},null,2));
})();
