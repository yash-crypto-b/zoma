import { api } from "../api.js";
import { setSession } from "../store.js";
import { brandMark, icon, toast } from "../ui.js";

const AUDIENCES = {
  diner: {
    role: "user",
    loginPath: "/auth/login",
    registerPath: "/auth/register",
    redirect: "/feed",
    profileKey: "user",
    registerSub: "Create a diner account to save your details and keep your sessions in sync.",
    loginSub: "Sign in to pick up where you left off.",
    registerCta: "Create diner account",
    loginCta: "Sign in",
  },
  partner: {
    role: "partner",
    loginPath: "/auth/loginFoodpartner",
    registerPath: "/auth/registerFoodpartner",
    redirect: "/partner",
    profileKey: "foodPartner",
    registerSub: "Open a kitchen account and get your restaurant onto Zomareel.",
    loginSub: "Sign in to your kitchen dashboard.",
    registerCta: "Create partner account",
    loginCta: "Sign in",
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function renderAuth(root, { navigate }) {
  const state = { audience: "diner", mode: "login", busy: false };

  document.title = "Sign in · Zomareel";

  root.innerHTML = `
    <div class="auth-page">
      <div class="aurora" aria-hidden="true">
        <span class="aurora-blob blob-1"></span>
        <span class="aurora-blob blob-2"></span>
        <span class="aurora-blob blob-3"></span>
      </div>

      <header class="auth-header">
        <a class="brand" href="#/login">
          ${brandMark(40)}
          <span class="brand-name">Zomareel</span>
        </a>
      </header>

      <main class="auth-layout">
        <section class="auth-story">
          <p class="eyebrow"><span class="dot"></span> Freshly plated</p>
          <h1>Food worth <span class="grad">reeling</span> about.</h1>
          <p class="lede">
            Zomareel connects hungry people with the kitchens behind their favourite plates.
            Sign in to manage your account, or step behind the counter as a food partner.
          </p>

        </section>

        <section class="auth-card" data-audience="diner" data-mode="login">
          <div class="segmented" role="tablist" aria-label="Account type">
            <button type="button" class="segmented-btn is-active" role="tab" aria-selected="true" data-audience-btn="diner">Diner</button>
            <button type="button" class="segmented-btn" role="tab" aria-selected="false" data-audience-btn="partner">Food partner</button>
            <span class="segmented-thumb" aria-hidden="true"></span>
          </div>

          <div class="auth-card-head">
            <h2 id="auth-heading">Welcome back</h2>
            <p class="muted" id="auth-sub">Sign in to pick up where you left off.</p>
          </div>

          <form id="auth-form" class="auth-form" novalidate>
            <label class="field" id="name-field" hidden>
              <span class="field-label">Full name <em>optional</em></span>
              <span class="field-control">
                ${icon("user")}
                <input name="name" type="text" maxlength="100" autocomplete="name" placeholder="Ada Lovelace" />
              </span>
            </label>

            <label class="field">
              <span class="field-label">Email</span>
              <span class="field-control">
                ${icon("mail")}
                <input name="email" type="email" required maxlength="255" autocomplete="email" placeholder="you@example.com" />
              </span>
            </label>

            <label class="field">
              <span class="field-label">Password</span>
              <span class="field-control">
                ${icon("lock")}
                <input name="password" type="password" required minlength="1" autocomplete="current-password" placeholder="Your password" />
              </span>
            </label>

            <p class="form-error" id="auth-error" role="alert" hidden></p>

            <button class="btn btn-primary btn-block" type="submit">
              <span class="btn-text">Sign in</span>
              <span class="spinner" hidden aria-hidden="true"></span>
            </button>
          </form>

          <p class="auth-switch">
            <span id="mode-label">New to Zomareel?</span>
            <button type="button" class="link-btn" id="mode-toggle">Create an account</button>
          </p>
        </section>
      </main>

      <footer class="auth-footer">
        <span>&copy; ${new Date().getFullYear()} Zomareel</span>
        <span class="footer-dot" aria-hidden="true"></span>
        <span>Fresh plates, real kitchens</span>
      </footer>
    </div>
  `;

  const card = root.querySelector(".auth-card");
  const form = root.querySelector("#auth-form");
  const heading = root.querySelector("#auth-heading");
  const sub = root.querySelector("#auth-sub");
  const nameField = root.querySelector("#name-field");
  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const passwordInput = form.elements.password;
  const submit = form.querySelector('button[type="submit"]');
  const submitText = submit.querySelector(".btn-text");
  const spinner = submit.querySelector(".spinner");
  const errorBox = root.querySelector("#auth-error");
  const modeLabel = root.querySelector("#mode-label");
  const modeToggle = root.querySelector("#mode-toggle");
  const audienceButtons = root.querySelectorAll("[data-audience-btn]");

  function sync() {
    const config = AUDIENCES[state.audience];
    const registering = state.mode === "register";

    card.dataset.audience = state.audience;
    card.dataset.mode = state.mode;

    audienceButtons.forEach((button) => {
      const isActive = button.dataset.audienceBtn === state.audience;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    nameField.hidden = !registering;
    nameInput.value = registering ? nameInput.value : "";

    heading.textContent = registering ? "Create your account" : "Welcome back";
    sub.textContent = registering ? config.registerSub : config.loginSub;
    submitText.textContent = registering ? config.registerCta : config.loginCta;
    passwordInput.autocomplete = registering ? "new-password" : "current-password";

    modeLabel.textContent = registering ? "Already have an account?" : "New to Zomareel?";
    modeToggle.textContent = registering ? "Sign in instead" : "Create an account";

    clearError();
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function setBusy(busy) {
    state.busy = busy;
    submit.disabled = busy;
    spinner.hidden = !busy;
    form.classList.toggle("is-busy", busy);
  }

  audienceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.busy || state.audience === button.dataset.audienceBtn) {
        return;
      }
      state.audience = button.dataset.audienceBtn;
      sync();
    });
  });

  modeToggle.addEventListener("click", () => {
    if (state.busy) {
      return;
    }
    state.mode = state.mode === "login" ? "register" : "login";
    sync();
    (state.mode === "register" ? nameInput : emailInput).focus();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (state.busy) {
      return;
    }

    const email = String(emailInput.value).trim();
    const password = String(passwordInput.value);
    const name = String(nameInput.value).trim();
    const registering = state.mode === "register";

    if (!EMAIL_PATTERN.test(email)) {
      showError("Enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!password || (registering && password.length < 12)) {
      showError(registering ? "Password must be at least 12 characters." : "Enter your password.");
      passwordInput.focus();
      return;
    }

    const config = AUDIENCES[state.audience];
    const path = registering ? config.registerPath : config.loginPath;
    const body = registering ? { email, password, name } : { email, password };

    clearError();
    setBusy(true);

    try {
      const result = await api(path, { method: "POST", body, auth: false });
      const profile = result[config.profileKey] ?? null;
      const displayName = profile?.name || email.split("@")[0];

      setSession({ token: result.token, role: config.role, profile });

      toast(
        registering ? `Welcome to Zomareel, ${displayName}!` : `Welcome back, ${displayName}!`,
        "success"
      );

      navigate(config.redirect);
    } catch (error) {
      showError(error.message || "Something went wrong. Try again.");
      if (error.status === 401) {
        passwordInput.select();
      }
    } finally {
      setBusy(false);
    }
  });

  sync();
  emailInput.focus();
}
