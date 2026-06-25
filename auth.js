(function () {
  const USER_HASH = "eadec9e1cce8540fca112cecba625af4319bcc0e2eca899a48e9d46314214e00";
  const PASS_HASH = "bda67e6e2ba5ed3771804114fc6a4ab1db637e9cb20c55afb6608c4c8bf78d6f";
  const SESSION_KEY = "steinmetz_webstudio_auth";

  const style = document.createElement("style");
  style.textContent = `
    html.auth-lock body > :not(.auth-screen) {
      display: none !important;
    }

    .auth-screen {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: grid;
      place-items: center;
      min-height: 100vh;
      padding: 24px;
      color: #f7fbff;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
      background:
        radial-gradient(circle at 50% 22%, rgba(56, 189, 248, 0.22), transparent 28rem),
        linear-gradient(135deg, #030712 0%, #050914 54%, #071827 100%);
    }

    .auth-card {
      width: min(100%, 430px);
      padding: 30px;
      border: 1px solid rgba(143, 204, 255, 0.22);
      border-radius: 14px;
      background: rgba(2, 8, 18, 0.84);
      box-shadow: 0 24px 80px rgba(14, 165, 233, 0.22);
      backdrop-filter: blur(20px);
    }

    .auth-card h1 {
      margin: 0 0 10px;
      font-size: 1.7rem;
      line-height: 1.1;
    }

    .auth-card p {
      margin: 0 0 22px;
      color: #aebdd2;
      line-height: 1.6;
    }

    .auth-card label {
      display: block;
      margin: 14px 0 7px;
      color: #eaf7ff;
      font-size: 0.86rem;
      font-weight: 800;
    }

    .auth-card input {
      width: 100%;
      min-height: 46px;
      padding: 12px 14px;
      border: 1px solid rgba(143, 204, 255, 0.24);
      border-radius: 8px;
      color: #f7fbff;
      font: inherit;
      background: rgba(5, 13, 27, 0.9);
      outline: none;
    }

    .auth-card input:focus {
      border-color: rgba(56, 189, 248, 0.76);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.18);
    }

    .auth-card button {
      width: 100%;
      min-height: 48px;
      margin-top: 20px;
      border: 0;
      border-radius: 8px;
      color: #02111f;
      font: inherit;
      font-weight: 900;
      cursor: pointer;
      background: linear-gradient(135deg, #f8fdff, #38bdf8);
    }

    .auth-error {
      min-height: 20px;
      margin-top: 12px;
      color: #ffb4b4;
      font-size: 0.92rem;
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);

  function lock() {
    document.documentElement.classList.add("auth-lock");
  }

  function unlock() {
    document.documentElement.classList.remove("auth-lock");
  }

  async function hash(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function showLogin() {
    const screen = document.createElement("div");
    screen.className = "auth-screen";
    screen.innerHTML = `
      <form class="auth-card" autocomplete="off">
        <h1>Gesch\u00fctzter Bereich</h1>
        <p>Diese Website ist vor\u00fcbergehend nur mit Benutzer und Passwort erreichbar.</p>
        <label for="auth-user">Benutzer</label>
        <input id="auth-user" name="user" type="text" autocomplete="username" required>
        <label for="auth-pass">Passwort</label>
        <input id="auth-pass" name="pass" type="password" autocomplete="current-password" required>
        <button type="submit">Einloggen</button>
        <div class="auth-error" aria-live="polite"></div>
      </form>
    `;
    document.body.prepend(screen);

    const form = screen.querySelector("form");
    const error = screen.querySelector(".auth-error");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      error.textContent = "";
      const formData = new FormData(form);
      const userHash = await hash(String(formData.get("user") || "").trim());
      const passHash = await hash(String(formData.get("pass") || ""));

      if (userHash === USER_HASH && passHash === PASS_HASH) {
        sessionStorage.setItem(SESSION_KEY, "ok");
        screen.remove();
        unlock();
        return;
      }

      error.textContent = "Benutzer oder Passwort ist falsch.";
      form.querySelector("#auth-pass").value = "";
      form.querySelector("#auth-pass").focus();
    });
  }

  lock();

  if (sessionStorage.getItem(SESSION_KEY) === "ok") {
    unlock();
    return;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showLogin, { once: true });
  } else {
    showLogin();
  }
})();
