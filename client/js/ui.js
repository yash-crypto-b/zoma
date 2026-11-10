const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function initials(name, email = "") {
  const source = (name || "").trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) {
    return "?";
  }

  return parts.map((part) => part[0].toUpperCase()).join("");
}

export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timeUntil(timestamp) {
  const diff = timestamp - Date.now();

  if (diff <= 0) {
    return "expired";
  }

  const minutes = Math.round(diff / 60000);
  if (minutes < 60) {
    return `in ${minutes} min`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 36) {
    return `in ${hours} h`;
  }

  return `in ${Math.round(hours / 24)} d`;
}

export function timeAgo(value) {
  if (!value) {
    return "";
  }

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return "";
  }

  const minutes = Math.round((Date.now() - then) / 60000);

  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return formatDate(value);
}

export function greeting() {
  const hour = new Date().getHours();

  if (hour < 5) {
    return "Late-night craving";
  }
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 17) {
    return "Good afternoon";
  }
  if (hour < 22) {
    return "Good evening";
  }
  return "Late-night craving";
}

export function toast(message, type = "info") {
  const container = document.getElementById("toaster");
  if (!container) {
    return;
  }

  const node = document.createElement("div");
  node.className = `toast toast-${type}`;
  node.setAttribute("role", type === "error" ? "alert" : "status");
  node.innerHTML = `
    <span class="toast-dot" aria-hidden="true"></span>
    <span class="toast-text">${escapeHtml(message)}</span>
    <button class="toast-close" type="button" aria-label="Dismiss notification">&times;</button>
  `;

  const remove = () => {
    node.classList.add("toast-leaving");
    window.setTimeout(() => node.remove(), 180);
  };

  node.querySelector(".toast-close").addEventListener("click", remove);
  container.appendChild(node);
  window.setTimeout(remove, 4200);
}

export function brandMark(size = 34) {
  return `
    <span class="brand-mark" style="--mark-size:${size}px" aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img" focusable="false">
        <defs>
          <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#3A4B53" />
            <stop offset="1" stop-color="#2A3A40" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="18" fill="url(#brandGradient)" />
        <path d="M26 20l18 12-18 12z" fill="#fff" />
      </svg>
    </span>
  `;
}

const ICONS = {
  user: '<path d="M20 21a8 8 0 1 0-16 0 8 8 0 0 0 16 0Z"/><path d="M4 40c0-5.5 5.4-9 12-9s12 3.5 12 9"/>',
  mail: '<rect x="3" y="6" width="26" height="20" rx="4"/><path d="m4.5 8.5 11.5 8 11.5-8"/>',
  lock: '<rect x="5" y="14" width="22" height="15" rx="4"/><path d="M10 14v-4a6 6 0 0 1 12 0v4"/>',
  arrow: '<path d="M6 16h20"/><path d="m19 9 7 7-7 7"/>',
  logout: '<path d="M13 5H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h6"/><path d="M20 11l5 5-5 5"/><path d="M25 16H12"/>',
  edit: '<path d="M21 5.5 26.5 11 13 24.5 6 26l1.5-7Z"/>',
  check: '<path d="m6 17 6.5 6.5L26 9"/>',
  shield: '<path d="M16 4l11 4v8c0 7-4.6 11.4-11 14-6.4-2.6-11-7-11-14V8Z"/><path d="m11 16 3.5 3.5L21 13"/>',
  store: '<path d="M5 13h22v15H5z"/><path d="M9 13V8l3-4h11l3 4v5"/><path d="M13 28v-8h6v8"/>',
  home: '<path d="m4 14 12-10 12 10"/><path d="M7 12.5V28h18V12.5"/>',
  spark: '<path d="M16 4l2.6 7.4L26 14l-7.4 2.6L16 24l-2.6-7.4L6 14l7.4-2.6Z"/>',
  clock: '<circle cx="16" cy="16" r="12"/><path d="M16 9v7.5l5 3"/>',
  key: '<circle cx="11" cy="11" r="6"/><path d="m15.5 15.5 9 9"/><path d="m21 21-3 3"/>',
  heart: '<path d="M16 27S5.5 20.8 5.5 14A5.9 5.9 0 0 1 16 9.7 5.9 5.9 0 0 1 26.5 14c0 6.8-10.5 13-10.5 13Z"/>',
  mute: '<path d="M6 12.5h4.5L17 7.5v17l-6.5-5H6Z"/><path d="m22 13 6 6"/><path d="m28 13-6 6"/>',
  volume: '<path d="M6 12.5h4.5L17 7.5v17l-6.5-5H6Z"/><path d="M21.5 12a6 6 0 0 1 0 8"/><path d="M25.5 8.5a11 11 0 0 1 0 15"/>',
  play: '<path d="M11.5 7.5 25 16l-13.5 8.5Z"/>',
  tag: '<path d="M16 5h9a2 2 0 0 1 2 2v9L15 28 4 17Z"/><circle cx="22.5" cy="9.5" r="1.6"/>',
  link: '<path d="M13 19a5 5 0 0 1 0-7l4-4a5 5 0 0 1 7 7l-2 2"/><path d="M19 13a5 5 0 0 1 0 7l-4 4a5 5 0 0 1-7-7l2-2"/>',
};

export function icon(name, size = 18) {
  const path = ICONS[name] || ICONS.spark;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`;
}
