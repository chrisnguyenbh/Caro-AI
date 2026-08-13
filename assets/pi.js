window.MiniPi = (() => {
  const SANDBOX = true;
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
      if (statusEl) statusEl.textContent = SANDBOX ? "Pi SDK • Sandbox" : "Pi SDK • Mainnet";
      return true;
    } catch (e) {
      console.error(e);
      if (statusEl) statusEl.textContent = "Pi SDK lỗi";
      return false;
    }
  }

  async function login(statusEl, buttonEl) {
    if (!ready || !window.Pi) {
      if (statusEl) statusEl.textContent = "Hãy mở trong Pi Browser/Sandbox";
      return null;
    }
    if (buttonEl) buttonEl.disabled = true;
    try {
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        handleIncompletePayment
      );
      currentAuth = auth;
      const username = auth?.user?.username || "Pioneer";
      localStorage.setItem("minigame_pi_username", username);
      if (statusEl) statusEl.textContent = "@" + username;
      if (buttonEl) buttonEl.textContent = "Đã đăng nhập";
      return auth;
    } catch (e) {
      console.error(e);
      if (statusEl) statusEl.textContent = "Chưa đăng nhập Pi";
      if (buttonEl) buttonEl.disabled = false;
      return null;
    }
  }

  async function handleIncompletePayment(payment) {
    console.warn("Pi incomplete payment found", payment);
    const paymentId = payment?.identifier;
    if (!paymentId) return;

    // If the user has already submitted the transaction, the SDK may provide
    // txid here. Complete it on the server so a stale payment does not block
    // the next sandbox test.
    const txid = payment?.transaction?.txid;
    if (!txid) return;

    try {
      await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, txid }),
      });
    } catch (e) {
      console.error("Unable to recover incomplete payment", e);
    }
  }

  function cachedUsername() {
    return localStorage.getItem("minigame_pi_username") || "";
  }

  function getAuth() {
    return currentAuth;
  }

  async function ensureAuth(statusEl, buttonEl) {
    return currentAuth || login(statusEl, buttonEl);
  }

  async function createTestPayment({ amount = 0.01, memo = "MiniGame Hub Test Payment" } = {}) {
    if (!ready || !window.Pi) throw new Error("Pi SDK chưa sẵn sàng. Hãy mở app trong Pi Browser Sandbox.");
    if (!currentAuth) throw new Error("Hãy đăng nhập Pi trước.");

    const paymentData = {
      amount,
      memo,
      metadata: {
        kind: "minigame_u2a_test",
        purpose: "Pi Developer Checklist - Process a Transaction on the App",
        createdAt: new Date().toISOString(),
      },
    };

    return window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: async (paymentId) => {
        console.log("onReadyForServerApproval", paymentId);
        const response = await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(data.message || data.error || "Server approval failed.");
        }
        return data;
      },

      onReadyForServerCompletion: async (paymentId, txid) => {
        console.log("onReadyForServerCompletion", paymentId, txid);
        const response = await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(data.message || data.error || "Server completion failed.");
        }
        return data;
      },

      onCancel: (paymentId) => {
        console.log("Pi payment cancelled", paymentId);
      },

      onError: (error, payment) => {
        console.error("Pi payment error", error, payment);
      },
    });
  }

  return {
    init,
    login,
    ensureAuth,
    getAuth,
    cachedUsername,
    createTestPayment,
    SANDBOX,
  };
})();
