import { api } from "../api.js";
import { updateSession } from "../store.js";
import {
  escapeHtml,
  formatDate,
  formatDateTime,
  greeting,
  icon,
  initials,
} from "../ui.js";
import { errorState, loadingState } from "../layout.js";
import { renderProfileEditor } from "./profile-editor.js";

export async function renderProfile(view, ctx) {
  const { navigate, setTitle } = ctx;
  setTitle("Profile");
  view.innerHTML = loadingState("Loading your account…");

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
    view.querySelector("[data-retry]")?.addEventListener("click", () => renderProfile(view, ctx));
    return;
  }

  const displayName = user.name || user.email.split("@")[0];

  view.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">${escapeHtml(greeting())}</p>
        <h2 class="view-title">${escapeHtml(displayName)}</h2>
        <p class="muted">Here's everything Zomareel knows about your account.</p>
      </div>
      <button class="btn btn-primary" type="button" data-edit-profile>
        ${icon("edit", 16)}
        <span>Edit profile</span>
      </button>
    </div>

    <div class="stat-grid profile-stats">
      <article class="stat-card" style="--i:0">
        <span class="stat-icon">${icon("mail", 18)}</span>
        <p class="stat-label">Email</p>
        <p class="stat-value stat-value-sm">${escapeHtml(user.email)}</p>
      </article>
      <article class="stat-card" style="--i:1">
        <span class="stat-icon">${icon("clock", 18)}</span>
        <p class="stat-label">Member since</p>
        <p class="stat-value">${escapeHtml(formatDate(user.created_at))}</p>
      </article>
      <article class="stat-card" style="--i:2">
        <span class="stat-icon">${icon("edit", 18)}</span>
        <p class="stat-label">Last updated</p>
        <p class="stat-value">${escapeHtml(formatDate(user.updated_at))}</p>
      </article>
    </div>

    <div class="panel-grid panel-grid-single">
      <section class="panel">
        <header class="panel-head">
          <h3>Account</h3>
          <span class="pill pill-ok">${icon("check", 12)} Active</span>
        </header>

        <div class="profile-row">
          <span class="avatar avatar-lg">${escapeHtml(initials(user.name, user.email))}</span>
          <div>
            <strong>${escapeHtml(user.name || displayName)}</strong>
            <p class="muted">${escapeHtml(user.email)}</p>
          </div>
        </div>

        <dl class="detail-list">
          <div><dt>Name</dt><dd>${escapeHtml(user.name || "Not set")}</dd></div>
          <div><dt>Email</dt><dd>${escapeHtml(user.email)}</dd></div>
          <div><dt>Created</dt><dd>${escapeHtml(formatDateTime(user.created_at))}</dd></div>
          <div><dt>Updated</dt><dd>${escapeHtml(formatDateTime(user.updated_at))}</dd></div>
        </dl>

        <button class="btn btn-ghost btn-block" type="button" data-edit-profile>${icon("edit", 16)} Edit details</button>
      </section>
    </div>
  `;

  view.querySelectorAll("[data-edit-profile]").forEach((button) => {
    button.addEventListener("click", async () => {
      await renderProfileEditor(view, ctx);
      const heading = view.querySelector(".view-head");
      if (!heading) return;
      const back = document.createElement("button");
      back.type = "button";
      back.className = "btn btn-ghost";
      back.textContent = "Back to profile";
      back.addEventListener("click", () => renderProfile(view, ctx));
      heading.append(back);
    });
  });
}
