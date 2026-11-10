import { brandMark, escapeHtml, icon, initials } from "./ui.js";

const NAV = {
  user: [
    { route: "/profile", label: "Profile", icon: "user" },
    { route: "/feed", label: "Feed", icon: "spark" },
  ],
  partner: [
    { route: "/partner", label: "Kitchen", icon: "store" },
    { route: "/menu", label: "Menu", icon: "spark" },
  ],
};

const ROLE_LABEL = {
  user: "Diner account",
  partner: "Food partner",
};

export function renderShell(root, { session }) {
  const profile = session.profile || {};
  const displayName = profile.name || profile.email || "Your account";
  const roleLabel = ROLE_LABEL[session.role] ?? "Account";
  const items = NAV[session.role] ?? NAV.user;

  root.innerHTML = `
    <div class="shell" data-role="${escapeHtml(session.role)}">
      <div class="sidebar-scrim" id="nav-scrim" hidden></div>

      <aside class="sidebar" id="sidebar">
        <a class="brand brand-sm" href="#${items[0].route}">
          ${brandMark(34)}
          <span class="brand-name">Zomareel</span>
        </a>

        <nav class="nav" aria-label="Main navigation">
          ${items
            .map(
              (item) => `
            <a class="nav-link" href="#${item.route}" data-route="${item.route}">
              ${icon(item.icon, 18)}
              <span>${item.label}</span>
            </a>`
            )
            .join("")}
        </nav>

        <div class="sidebar-foot">
          <div class="account-chip">
            <span class="avatar">${escapeHtml(initials(profile.name, profile.email))}</span>
            <span class="account-meta">
              <strong>${escapeHtml(displayName)}</strong>
              <em>${escapeHtml(profile.email || roleLabel)}</em>
            </span>
          </div>
          <button class="btn btn-ghost btn-block" type="button" id="logout-btn">
            ${icon("logout", 16)}
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <button
            class="icon-btn nav-toggle"
            type="button"
            id="nav-toggle"
            aria-label="Open navigation"
            aria-expanded="false"
            aria-controls="sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div class="topbar-title">
            <p class="eyebrow">${escapeHtml(roleLabel)}</p>
            <h1 id="page-title">${session.role === "partner" ? "Kitchen" : "Profile"}</h1>
          </div>

          <span class="role-badge" data-role="${escapeHtml(session.role)}">
            ${session.role === "partner" ? icon("store", 14) : icon("user", 14)}
            ${escapeHtml(roleLabel)}
          </span>
        </header>

        <div id="view" class="view"></div>
      </div>
    </div>
  `;

  const shell = root.querySelector(".shell");
  const sidebar = root.querySelector("#sidebar");
  const scrim = root.querySelector("#nav-scrim");
  const navToggle = root.querySelector("#nav-toggle");
  const pageTitle = root.querySelector("#page-title");
  const view = root.querySelector("#view");

  function setNavOpen(open) {
    shell.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    scrim.hidden = !open;
  }

  navToggle.addEventListener("click", () => setNavOpen(!shell.classList.contains("nav-open")));
  scrim.addEventListener("click", () => setNavOpen(false));
  sidebar.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  function setActive(route) {
    shell.dataset.page = route === "/menu" ? "feed" : route.slice(1);
    sidebar.querySelectorAll(".nav-link").forEach((link) => {
      const isActive = link.dataset.route === route;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function setTitle(title) {
    pageTitle.textContent = title;
    document.title = `${title} · Zomareel`;
  }

  function onLogout(handler) {
    root.querySelector("#logout-btn").addEventListener("click", handler);
  }

  return { view, setTitle, setActive, onLogout, closeNav: () => setNavOpen(false) };
}

export function updateAccountChip(root, profile) {
  const chip = root.querySelector(".account-chip");
  if (!chip) {
    return;
  }

  const displayName = profile.name || profile.email || "Your account";
  chip.querySelector(".avatar").textContent = initials(profile.name, profile.email);
  chip.querySelector("strong").textContent = displayName;
  chip.querySelector("em").textContent = profile.email || "";
}

export function loadingState(message = "Loading…") {
  return `
    <div class="state-card">
      <span class="spinner spinner-lg" aria-hidden="true"></span>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

export function errorState(message, { retry = true } = {}) {
  return `
    <div class="state-card state-card-error">
      <span class="state-icon">${icon("shield", 22)}</span>
      <h2>We couldn't load this page</h2>
      <p>${escapeHtml(message)}</p>
      ${retry ? '<button class="btn btn-ghost" type="button" data-retry>Try again</button>' : ""}
    </div>
  `;
}
