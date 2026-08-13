const API_BASE = "https://api.minepi.com/v2";
function json(res,status,body){res.status(status).setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(body));}
export default async function handler(req,res){
  if(req.method!=="GET") return json(res,405,{ok:false,error:"method_not_allowed"});
  const key=process.env.PI_API_KEY;
  if(!key) return json(res,503,{ok:false,error:"server_not_configured"});
  const id=String(req.query?.paymentId||"").trim();
  if(!id) return json(res,400,{ok:false,error:"missing_payment_id"});
  try{
    const r=await fetch(`${API_BASE}/payments/${encodeURIComponent(id)}`,{headers:{Authorization:`Key ${key}`,Accept:"application/json"}});
    const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
    return json(res,r.ok?200:502,{ok:r.ok,debug:true,upstreamStatus:r.status,payment:data||text||null,paymentId:id});
  }catch(e){return json(res,500,{ok:false,error:"server_error",message:e?.message||String(e),paymentId:id});}
}
