const API_BASE="https://api.minepi.com/v2";
function json(res,status,body){res.status(status);res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));}
export default async function handler(req,res){
 if(req.method!=="GET") return json(res,405,{ok:false,error:"method_not_allowed"});
 const raw=process.env.PI_API_KEY||""; const key=raw.trim().replace(/^Key\s+/i,"");
 if(!key)return json(res,503,{ok:false,configured:false,error:"missing_api_key"});
 const fake="debug-invalid-payment-id";
 try{
  const r=await fetch(`${API_BASE}/payments/${fake}`,{headers:{"Authorization":`Key ${key}`,"Accept":"application/json"}});
  const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  return json(res,200,{ok:true,network:"Pi Mainnet",apiKeyAccepted:r.status!==401&&r.status!==403,upstreamStatus:r.status,upstreamStatusText:r.statusText,response:data||text||null,keyLength:key.length});
 }catch(e){return json(res,502,{ok:false,network:"Pi Mainnet",error:"pi_api_unreachable",message:e?.message||String(e),keyLength:key.length});}
}
