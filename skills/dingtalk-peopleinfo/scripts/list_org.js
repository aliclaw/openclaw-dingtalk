const cfg=require('/home/admin/.openclaw/openclaw.json');
(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;

  // Get all dept ids starting from 1
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

  // Get dept details
  const depts=[];
  for(const deptId of deptIds){
    const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/department/get?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({dept_id:deptId})
    });
    const json=await res.json();
    if(json.result){
      depts.push({dept_id:deptId,name:json.result.name,parent_id:json.result.parent_id});
    }
  }

  // Get users by dept - store dept info with each user
  const usersByDept={};
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
        const key=u.userid;
        if(!usersByDept[key]){
          usersByDept[key]={userid:u.userid,name:u.name,dept_id:deptId};
        }
      }
      hasMore=result.has_more;cursor=result.next_cursor||0;
    }
  }

  // Output dept structure first
  console.log("=== DEPARTMENTS ===");
  for(const d of depts){
    console.log(`${d.dept_id}|${d.name}|${d.parent_id}`);
  }

  console.log("\n=== USERS ===");
  for(const [userid, u] of Object.entries(usersByDept)){
    console.log(`${u.name}|${userid}|${u.dept_id}`);
  }
})();
