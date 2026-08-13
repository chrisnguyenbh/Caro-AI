window.MiniPi = (() => {
  const SANDBOX = false;
  let ready = false;
  let currentAuth = null;

  async function init(statusEl) {
    if (!window.Pi) {
      if (statusEl) statusEl.textContent = "Pi SDK chưa tải";
      return false;
    }
    try {
      await window.Pi.init({ version: "2.0", sandbox: SANDBOX });
      ready = true;
      if (statusEl) statusEl.textContent = "Pi SDK • Mainnet";
      return true;
    } catch (e) {
      console.error("Pi.init failed", e);
      if (statusEl) statusEl.textContent = "Pi SDK lỗi";
      return false;
    }
  }

  async function login(statusEl, buttonEl) {
    if (!ready || !window.Pi) {
      if (statusEl) statusEl.textContent = "Hãy mở app trong Pi Browser";
      return null;
    }
    if (buttonEl) buttonEl.disabled = true;
    try {
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        onIncompletePaymentFound
      );
      currentAuth = auth;
      const username = auth?.user?.username || "Pioneer";
      localStorage.setItem("minigame_pi_username", username);
      if (statusEl) statusEl.textContent = "@" + username;
      if (buttonEl) buttonEl.textContent = "Đã đăng nhập";
      return auth;
    } catch (e) {
      console.error("Pi.authenticate failed", e);
      if (statusEl) statusEl.textContent = "Chưa đăng nhập Pi";
      if (buttonEl) buttonEl.disabled = false;
      return null;
    }
  }

  async function onIncompletePaymentFound(payment) {
    if (!payment?.identifier) return;
    console.log("Incomplete Pi payment found", payment);
    const txid = payment?.transaction?.txid || null;
    try {
      if (txid) {
        await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: payment.identifier, txid })
        });
      } else {
        await fetch("/api/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: payment.identifier })
        });
      }
    } catch (e) {
      console.warn("Could not recover incomplete payment", e);
    }
  }

  function cachedUsername() {
    return localStorage.getItem("minigame_pi_username") || "";
  }
  function getAuth() { return currentAuth; }
  async function ensureAuth(statusEl, buttonEl) {
    return currentAuth || login(statusEl, buttonEl);
  }

  async function createPayment({ amount, memo, metadata, statusEl }) {
    const auth = currentAuth;
    if (!auth?.accessToken) throw new Error("Hãy đăng nhập Pi trước khi thanh toán.");

    const paymentData = { amount, memo, metadata };
    const paymentCallbacks = {
      onReadyForServerApproval: async (paymentId) => {
        if (statusEl) statusEl.textContent = `Đang duyệt Payment ID: ${paymentId}`;
        const r = await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) {
          const d = data?.diagnostic;
          const detail = [
            data?.message || "Server approval thất bại",
            d?.upstreamStatus ? `HTTP Pi: ${d.upstreamStatus}` : "",
            d?.upstreamStatusText || "",
            data?.requestId ? `Debug ID: ${data.requestId}` : ""
          ].filter(Boolean).join(" | ");
          if (statusEl) statusEl.textContent = "❌ APPROVE: " + detail;
          console.error("Pi approval debug", data);
          throw new Error(detail);
        }
        if (statusEl) statusEl.textContent = "Đã duyệt. Hãy xác nhận giao dịch trong Pi Wallet…";
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        if (statusEl) statusEl.textContent = "Đang xác nhận giao dịch trên Pi Mainnet…";
        const r = await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok || !data.ok) {
          const d = data?.diagnostic;
          const detail = [
            data?.message || "Server completion thất bại",
            d?.upstreamStatus ? `HTTP Pi: ${d.upstreamStatus}` : "",
            data?.requestId ? `Debug ID: ${data.requestId}` : ""
          ].filter(Boolean).join(" | ");
          if (statusEl) statusEl.textContent = "❌ COMPLETE: " + detail;
          console.error("Pi completion debug", data);
          throw new Error(detail);
        }
        if (statusEl) statusEl.textContent = `✅ Thanh toán thành công. TX: ${txid}`;
      },
      onCancel: (paymentId) => {
        console.warn("Pi payment cancelled", paymentId);
        if (statusEl) statusEl.textContent = "Giao dịch đã được hủy.";
      },
      onError: (error, payment) => {
        console.error("Pi payment error", error, payment);
        if (statusEl) statusEl.textContent = "❌ Pi payment error: " + (error?.message || error || "Unknown error");
      }
    };

    return window.Pi.createPayment(paymentData, paymentCallbacks);
  }

  return { init, login, ensureAuth, getAuth, cachedUsername, createPayment, SANDBOX };
})();
