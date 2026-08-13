const API_BASE = "https://api.minepi.com/v2";
function json(res,status,body){res.status(status);res.setHeader("Content-Type","application/json; charset=utf-8");res.setHeader("Cache-Control","no-store, no-cache, must-revalidate");res.end(JSON.stringify(body));}
function rid(){return `dbg_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;}
export default async function handler(req,res){
  const requestId=rid(); const started=Date.now();
  if(req.method!=="POST") return json(res,405,{ok:false,debug:true,requestId,error:"method_not_allowed"});
  const raw=process.env.PI_API_KEY||""; const key=raw.trim().replace(/^Key\\s+/i,"");
  if(!key) return json(res,503,{ok:false,debug:true,requestId,error:"server_not_configured",message:"PI_API_KEY is missing."});
  let body=req.body||{}; if(typeof body==="string"){try{body=JSON.parse(body)}catch{body={}}}
  const paymentId=String(body.paymentId||"").trim();
  if(!paymentId) return json(res,400,{ok:false,debug:true,requestId,error:"missing_payment_id"});
  const url=`${API_BASE}/payments/${encodeURIComponent(paymentId)}/approve`;
  console.log(JSON.stringify({debug:true,requestId,stage:"before_approve",paymentId,method:"POST",url,network:"mainnet",keyPresent:true,keyLength:key.length}));
  try{
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),8000);
    let r;
    try{
      // Match Pi's documented approval request: POST with Authorization header and no request body.
      r=await fetch(url,{method:"POST",headers:{"Authorization":`Key ${key}`,"Accept":"application/json"},signal:controller.signal});
    }finally{clearTimeout(timer)}
    const text=await r.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
    const diagnostic={requestId,paymentId,upstreamStatus:r.status,upstreamStatusText:r.statusText,durationMs:Date.now()-started,endpoint:"POST /v2/payments/{payment_id}/approve",network:"mainnet"};
    console.log(JSON.stringify({debug:true,stage:"after_approve",...diagnostic,response:data||text||null}));
    if(!r.ok) return json(res,r.status,{ok:false,debug:true,requestId,error:"pi_approval_failed",message:data?.error||data?.message||text||`Pi returned HTTP ${r.status}`,diagnostic,pi:data||text||null});
    return json(res,200,{ok:true,debug:true,requestId,paymentId,payment:data,diagnostic});
  }catch(e){
    const timeout=e?.name==="AbortError"; const diagnostic={requestId,paymentId,durationMs:Date.now()-started,endpoint:"POST /v2/payments/{payment_id}/approve",network:"mainnet"};
    console.error(JSON.stringify({debug:true,stage:"approve_exception",...diagnostic,error:e?.message||String(e)}));
    return json(res,timeout?504:500,{ok:false,debug:true,requestId,error:timeout?"pi_api_timeout":"server_error",message:timeout?"Pi Mainnet API did not answer within 8 seconds.":(e?.message||"Unexpected server error"),diagnostic});
  }
}
