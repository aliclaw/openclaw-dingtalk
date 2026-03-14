const cfg=require('/home/admin/.openclaw/openclaw.json');
(async()=>{
  const appKey=cfg.channels.dingtalk.clientId;
  const appSecret=cfg.channels.dingtalk.clientSecret;
  const tokenRes=await fetch(`https://oapi.dingtalk.com/gettoken?appkey=${appKey}&appsecret=${appSecret}`);
  const tokenJson=await tokenRes.json();
  const token=tokenJson.access_token;

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

  const usersMap=new Map();
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
        if(!usersMap.has(key)){
          usersMap.set(key,{userid:u.userid,name:u.name});
        }
      }
      hasMore=result.has_more;cursor=result.next_cursor||0;
    }
  }

  const users=Array.from(usersMap.values());
  const out=[];
  for(const u of users){
    const res=await fetch(`https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${token}` ,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({userid:u.userid})
    });
    const json=await res.json();
    const r=json.result||{};
    out.push({name:r.name||u.name, userid:u.userid, mobile:r.mobile||'', birthday:r.birthday||''});
  }

  console.log(JSON.stringify({deptCount:depts.length,userCount:out.length,depts,users:out},null,2));
})();
