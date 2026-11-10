import { api } from "./api.js";
import { clearSession, getSession } from "./store.js";
import { renderShell } from "./layout.js";
import { toast } from "./ui.js";
import { renderAuth } from "./views/auth.js";
import { renderFeed } from "./views/feed.js";
import { renderProfile } from "./views/profile.js";
import { renderPartner } from "./views/partner.js";

const root = document.getElementById("app");

const HOME_ROUTE = { user: "/feed", partner: "/partner" };
const ROUTES = {
  user: ["/feed", "/profile"],
  partner: ["/partner", "/menu"],
};

let shell = null;
let renderToken = 0;

function readRoute() {
  return window.location.hash.replace(/^#/, "").split("?")[0] || "/";
}

function navigate(path) {
  if (readRoute() === path) {
    render();
    return;
  }
  window.location.hash = path;
}

async function handleLogout() {
  try {
    await api("/auth/logout", { method: "POST", auth: false });
  } catch {
    // A failed logout shouldn't trap the user in a half-broken session.
  }

  clearSession();
  shell = null;
  toast("Signed out.", "info");
  navigate("/login");
}

async function render() {
  const token = ++renderToken;
  const session = getSession();
  const route = readRoute();

  if (!session) {
    shell = null;

    if (route !== "/login") {
      navigate("/login");
      return;
    }

    renderAuth(root, { navigate });
    return;
  }

  const home = HOME_ROUTE[session.role] ?? "/profile";

  if (route === "/" || route === "/login" || !ROUTES[session.role]?.includes(route)) {
    navigate(home);
    return;
  }

  if (!shell) {
    shell = renderShell(root, { session });
    shell.onLogout(handleLogout);
  }

  shell.setActive(route);

  const ctx = {
    session,
    navigate,
    setTitle: shell.setTitle,
  };

  if (route === "/feed" || route === "/menu") {
    await renderFeed(shell.view, ctx);
  } else if (route === "/profile") {
    await renderProfile(shell.view, ctx);
  } else if (route === "/partner") {
    await renderPartner(shell.view, ctx);
  }

  if (token !== renderToken) {
    return;
  }
}

window.addEventListener("hashchange", render);
render();
