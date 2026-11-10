import { api } from "../api.js";
import { updateSession } from "../store.js";
import {
  escapeHtml,
  formatDateTime,
  icon,
  initials,
  toast,
} from "../ui.js";
import { errorState, loadingState, updateAccountChip } from "../layout.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function renderProfileEditor(view, ctx) {
  const { navigate, setTitle } = ctx;
  setTitle("Profile");
  view.innerHTML = loadingState("Loading your profile…");

  let user;
  try {
    const data = await api("/users/me");
    user = data.user;
    updateSession({ profile: user });
  } catch (error) {
    if (error.status === 401) {
      navigate("/login");
      return;
    }

    view.innerHTML = errorState(error.message);
    view.querySelector("[data-retry]")?.addEventListener("click", () => renderProfileEditor(view, ctx));
    return;
  }

  view.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">Account settings</p>
        <h2 class="view-title">Your profile</h2>
        <p class="muted">Update the details we keep on file for you.</p>
      </div>
    </div>

    <div class="profile-summary">
      <span class="avatar avatar-xl">${escapeHtml(initials(user.name, user.email))}</span>
      <div>
        <strong>${escapeHtml(user.name || user.email.split("@")[0])}</strong>
        <p class="muted">${escapeHtml(user.email)}</p>
      </div>
      <span class="pill">Member #${escapeHtml(user.id)}</span>
    </div>

    <form class="panel panel-form" id="profile-form" novalidate>
      <header class="panel-head">
        <h3>Account details</h3>
      </header>

      <div class="form-row">
        <label class="field">
          <span class="field-label">Full name</span>
          <span class="field-control">
            ${icon("user")}
            <input name="name" type="text" maxlength="100" autocomplete="name" value="${escapeHtml(user.name || "")}" placeholder="Ada Lovelace" />
          </span>
        </label>

        <label class="field">
          <span class="field-label">Email</span>
          <span class="field-control">
            ${icon("mail")}
            <input name="email" type="email" required maxlength="255" autocomplete="email" value="${escapeHtml(user.email)}" />
          </span>
        </label>
      </div>

      <p class="form-hint">Changing your email also changes the address you sign in with.</p>
      <label class="field">
        <span class="field-label">Current password (required to change email)</span>
        <span class="field-control"><input name="currentPassword" type="password" autocomplete="current-password" maxlength="72" /></span>
      </label>
      <p class="form-error" id="profile-error" role="alert" hidden></p>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit">
          <span class="btn-text">Save changes</span>
          <span class="spinner" hidden aria-hidden="true"></span>
        </button>
        <button class="btn btn-ghost" type="reset">Reset</button>
        <span class="save-state" id="save-state" hidden>${icon("check", 14)} Saved</span>
      </div>
    </form>

    <section class="panel">
      <header class="panel-head">
        <h3>Record</h3>
        <span class="pill">Read only</span>
      </header>
      <dl class="detail-list">
        <div><dt>Account ID</dt><dd>#${escapeHtml(user.id)}</dd></div>
        <div><dt>Created</dt><dd id="meta-created">${escapeHtml(formatDateTime(user.created_at))}</dd></div>
        <div><dt>Last updated</dt><dd id="meta-updated">${escapeHtml(formatDateTime(user.updated_at))}</dd></div>
      </dl>
    </section>
  `;

  const form = view.querySelector("#profile-form");
  const nameInput = form.elements.name;
  const emailInput = form.elements.email;
  const submit = form.querySelector('button[type="submit"]');
  const submitText = submit.querySelector(".btn-text");
  const spinner = submit.querySelector(".spinner");
  const errorBox = view.querySelector("#profile-error");
  const saveState = view.querySelector("#save-state");
  const metaUpdated = view.querySelector("#meta-updated");
  const shell = view.closest(".shell");

  let saveTimer;

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
    saveState.hidden = true;
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function currentPayload() {
    return {
      name: String(nameInput.value).trim(),
      email: String(emailInput.value).trim(),
    };
  }

  form.addEventListener("input", clearError);

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      nameInput.value = user.name || "";
      emailInput.value = user.email;
      clearError();
      saveState.hidden = true;
    }, 0);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = currentPayload();

    if (payload.name.length === 0) {
      showError("Name can't be empty.");
      nameInput.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(payload.email)) {
      showError("Enter a valid email address.");
      emailInput.focus();
      return;
    }

    const changes = {};
    if (payload.name !== (user.name || "")) {
      changes.name = payload.name;
    }
    if (payload.email.toLowerCase() !== user.email.toLowerCase()) {
      changes.email = payload.email;
      changes.currentPassword = form.elements.currentPassword.value;
      if (!changes.currentPassword) { showError('Enter your current password to change email.'); return; }
    }

    if (Object.keys(changes).length === 0) {
      toast("Nothing to save yet.", "info");
      return;
    }

    clearError();
    submit.disabled = true;
    spinner.hidden = false;
    submitText.textContent = "Saving…";

    try {
      const data = await api("/users/me", { method: "PATCH", body: changes });
      user = data.user;
      form.elements.currentPassword.value = "";
      updateSession({ profile: user });

      nameInput.value = user.name || "";
      emailInput.value = user.email;
      metaUpdated.textContent = formatDateTime(user.updated_at);

      if (shell) {
        updateAccountChip(shell, user);
      }

      saveState.hidden = false;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveState.hidden = true;
      }, 3200);

      toast("Profile updated.", "success");
    } catch (error) {
      if (error.status === 401) {
        ctx.navigate("/login");
        return;
      }
      showError(error.message || "Could not save your changes.");
    } finally {
      submit.disabled = false;
      spinner.hidden = true;
      submitText.textContent = "Save changes";
    }
  });
}
