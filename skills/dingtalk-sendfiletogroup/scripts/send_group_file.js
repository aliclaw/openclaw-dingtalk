const axios=require('axios');
const fs=require('fs');
const FormData=require('form-data');
const cfg=require('/root/.openclaw/openclaw.json');

const appKey=cfg.channels.dingtalk.clientId;
const appSecret=cfg.channels.dingtalk.clientSecret;
const robotCode=cfg.channels.dingtalk.robotCode||appKey;

const openConversationId=process.argv[2];
const filePath=process.argv[3];
if(!openConversationId || !filePath){
  console.error('Usage: node send_group_file.js <openConversationId> <filePath>');
  process.exit(1);
}
if(!fs.existsSync(filePath)){
  console.error('File not found:', filePath);
  process.exit(1);
}

(async()=>{
  const token=(await axios.post('https://api.dingtalk.com/v1.0/oauth2/accessToken',{appKey,appSecret})).data.accessToken;

  const form=new FormData();
  form.append('media', fs.createReadStream(filePath));
  const uploadUrl=`https://oapi.dingtalk.com/media/upload?access_token=${token}&type=file`;
  const uploadRes=await axios.post(uploadUrl, form, {headers: form.getHeaders()});
  if(uploadRes.data.errcode!==0){
    throw new Error('upload failed: '+JSON.stringify(uploadRes.data));
  }
  const mediaId=uploadRes.data.media_id;

  const msgParam={ mediaId, fileName: filePath.split('/').pop() };
  const body={
    robotCode,
    openConversationId,
    msgKey:'sampleFile',
    msgParam: JSON.stringify(msgParam)
  };
  const sendRes=await axios.post('https://api.dingtalk.com/v1.0/robot/groupMessages/send', body, {headers:{'x-acs-dingtalk-access-token':token}});
  console.log('uploadRes', uploadRes.data);
  console.log('sendRes', sendRes.data);
})().catch(e=>{
  console.error('Error:', e.response?.data||e.message);
  process.exit(1);
});
