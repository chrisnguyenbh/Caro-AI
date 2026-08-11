
window.MiniPi = (() => {
  const SANDBOX = true;
  let ready = false;

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
      const auth = await window.Pi.authenticate(["username"], () => {});
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

  function cachedUsername() {
    return localStorage.getItem("minigame_pi_username") || "";
  }

  return { init, login, cachedUsername, SANDBOX };
})();
