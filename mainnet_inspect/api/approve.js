const API_BASE = "https://api.minepi.com/v2";

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.end(JSON.stringify(body));
}

function requestId() {
  return `dbg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  const rid = requestId();
  const started = Date.now();

  if (req.method !== "POST") {
    return json(res, 405, { ok:false, debug:true, requestId:rid, error:"method_not_allowed" });
  }

  const rawApiKey = process.env.PI_API_KEY;
  // Accept either the raw portal key or a value accidentally copied with the `Key ` prefix.
  const apiKey = rawApiKey ? rawApiKey.trim().replace(/^Key\s+/i, "") : "";
  if (!apiKey) {
    return json(res, 503, {
      ok:false, debug:true, requestId:rid,
      error:"server_not_configured",
      message:"PI_API_KEY is missing in Vercel Environment Variables."
    });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const paymentId = String(body.paymentId || "").trim();
  if (!paymentId) {
    return json(res, 400, { ok:false, debug:true, requestId:rid, error:"missing_payment_id" });
  }

  const url = `${API_BASE}/payments/${encodeURIComponent(paymentId)}/approve`;
  const startedPi = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let r;
    try {
      r = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}

    console.log(JSON.stringify({
      debug: true,
      requestId: rid,
      action: "approve",
      paymentId,
      upstreamStatus: r.status,
      upstreamStatusText: r.statusText,
      durationMs: Date.now() - startedPi,
      response: data || text
    }));

    if (!r.ok) {
      return json(res, r.status, {
        ok:false,
        debug:true,
        requestId:rid,
        error:"pi_approval_failed",
        message: data?.error || data?.message || text || "Pi approval failed",
        diagnostic: {
          apiKeyFormat: /^Key\s+/i.test(rawApiKey || "") ? "prefixed_key_normalized" : "raw_key",
          upstreamStatus: r.status,
          upstreamStatusText: r.statusText,
          durationMs: Date.now() - startedPi,
          endpoint: "/v2/payments/{payment_id}/approve",
          paymentId
        },
        pi: data || text || null
      });
    }

    return json(res, 200, {
      ok:true,
      debug:true,
      requestId:rid,
      payment:data,
      diagnostic:{
        upstreamStatus:r.status,
        durationMs:Date.now() - startedPi,
        endpoint:"/v2/payments/{payment_id}/approve",
        paymentId
      }
    });
  } catch (e) {
    console.error(JSON.stringify({
      debug:true,
      requestId:rid,
      action:"approve",
      paymentId,
      error:e?.message || String(e),
      durationMs:Date.now() - started
    }));

    const timeout = e?.name === "AbortError";
    return json(res, 504, {
      ok:false,
      debug:true,
      requestId:rid,
      error: timeout ? "pi_api_timeout" : "server_error",
      message: timeout
        ? "Pi Mainnet API did not answer within 10 seconds."
        : (e?.message || "Unexpected server error"),
      diagnostic:{
        apiKeyFormat: /^Key\s+/i.test(rawApiKey || "") ? "prefixed_key_normalized" : "raw_key",
        endpoint:"/v2/payments/{payment_id}/approve",
        paymentId,
        durationMs:Date.now() - started
      }
    });
  }
}
