const PI_API_BASE = "https://api.minepi.com/v2";

function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.end(JSON.stringify(body));
}

function getBody(req) {
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  return body || {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const apiKey = process.env.PI_API_KEY;
  if (!apiKey) {
    return json(res, 503, { ok: false, error: "server_not_configured", message: "PI_API_KEY is missing." });
  }

  const body = getBody(req);
  const paymentId = String(body.paymentId || "").trim();
  const txid = String(body.txid || "").trim();
  if (!paymentId || !txid) {
    return json(res, 400, { ok: false, error: "missing_payment_data", message: "paymentId and txid are required." });
  }

  try {
    const response = await fetch(`${PI_API_BASE}/payments/${encodeURIComponent(paymentId)}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return json(res, response.status, {
        ok: false,
        error: "pi_complete_failed",
        message: data?.error || data?.message || `Pi completion returned HTTP ${response.status}`,
        pi: data,
      });
    }
    return json(res, 200, { ok: true, payment: data });
  } catch (err) {
    console.error("Pi completion failed", err);
    return json(res, 502, { ok: false, error: "pi_api_unreachable", message: err?.message || "Pi API request failed." });
  }
}
