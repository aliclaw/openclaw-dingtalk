const webhook=process.argv[2];
const content=process.argv.slice(3).join(' ');
if(!webhook||!content){
  console.error('Usage: node send_group_webhook.js <webhook_url> <content>');
  process.exit(1);
}
(async()=>{
  const res=await fetch(webhook,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({msgtype:'text',text:{content}})
  });
  const json=await res.json();
  console.log(JSON.stringify(json,null,2));
})();
