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
  console.log(JSON.stringify({deptCount:depts.length,depts},null,2));
})();
