import { api } from "../api.js";
import { decodeToken } from "../store.js";
import {
  escapeHtml,
  icon,
  initials,
  timeAgo,
  toast,
} from "../ui.js";
import { errorState, loadingState } from "../layout.js";

const formatPrice = (value) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "INR",
  }).format(Number(value));

const formatCount = (value) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

const reelItemMarkup = (reel) => {
  const thumbnail =
    reel.media_type === "video"
      ? reel.poster_url
      : reel.media_url;

  const meta = [
    reel.price === null || reel.price === undefined ? null : formatPrice(reel.price),
    `${formatCount(reel.likes)} likes`,
    timeAgo(reel.created_at),
  ]
    .filter(Boolean)
    .join(" · ");

  return `
    <article class="partner-reel">
      <div class="partner-reel-thumb">
        ${
          thumbnail
            ? `<img src="${escapeHtml(thumbnail)}" alt="" loading="lazy" decoding="async" />`
            : `<span class="partner-reel-blank">${icon(reel.media_type === "video" ? "play" : "spark", 18)}</span>`
        }
        ${
          reel.media_type === "video"
            ? `<span class="partner-reel-badge">${icon("play", 10)} Video</span>`
            : ""
        }
      </div>
      <div class="partner-reel-body">
        <strong>${escapeHtml(reel.dish_name || "Untitled reel")}</strong>
        <p class="muted">${escapeHtml(meta)}</p>
      </div>
    </article>
  `;
};

export async function renderPartner(view, ctx) {
  const { session, setTitle, navigate } = ctx;
  setTitle("Kitchen");

  const claims = decodeToken(session.token) || {};
  const profile = session.profile || {};
  const email = profile.email || claims.email || "—";
  const displayName = profile.name || email.split("@")[0];
  const partnerId = profile.id ?? claims.partnerId ?? "—";

  view.innerHTML = loadingState("Loading your kitchen…");

  let reels;
  let nextPage = null;

  try {
    const data = await api("/reels/mine");
    nextPage = data.nextPage;
    reels = Array.isArray(data.reels) ? data.reels : [];
  } catch (error) {
    if (error.status === 401) {
      navigate("/login");
      return;
    }

    view.innerHTML = errorState(error.message);
    view.querySelector("[data-retry]")?.addEventListener("click", () =>
      renderPartner(view, ctx)
    );
    return;
  }

  view.innerHTML = `
    <div class="view-head">
      <div>
        <p class="eyebrow">Food partner</p>
        <h2 class="view-title">${escapeHtml(displayName)}</h2>
        <p class="muted">Post reels to the diner feed and keep an eye on your kitchen.</p>
      </div>
      <a class="btn btn-primary" href="#/menu">${icon("spark", 16)} Menu</a>
    </div>

    <div class="panel-grid panel-grid-single">
      <section class="panel">
        <header class="panel-head">
          <h3>Partner profile</h3>
          <span class="pill">${icon("store", 12)} Kitchen</span>
        </header>

        <div class="profile-row">
          <span class="avatar avatar-lg">${escapeHtml(initials(profile.name, email))}</span>
          <div>
            <strong>${escapeHtml(displayName)}</strong>
            <p class="muted">${escapeHtml(email)}</p>
          </div>
        </div>

        <dl class="detail-list">
          <div><dt>Partner ID</dt><dd>#${escapeHtml(partnerId)}</dd></div>
          <div><dt>Name</dt><dd>${escapeHtml(profile.name || "Not set")}</dd></div>
          <div><dt>Email</dt><dd>${escapeHtml(email)}</dd></div>
        </dl>
      </section>

    </div>

    <section class="panel panel-form">
      <header class="panel-head">
        <h3>Post a reel</h3>
        <span class="pill">${icon("spark", 12)} Goes straight to the diner feed</span>
      </header>

      <form id="reel-form" class="auth-form" novalidate>
        <div class="form-row">
          <label class="field">
            <span class="field-label">Dish name</span>
            <span class="field-control">
              ${icon("spark")}
              <input name="dish_name" type="text" maxlength="140" placeholder="Margherita DOP" />
            </span>
          </label>

          <div class="field price-picker">
            <label class="field-label" for="reel-price">Price in rupees <em>optional</em></label>
            <span class="field-control"><span aria-hidden="true">₹</span>
              <input id="reel-price" name="price" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off" aria-label="Price in rupees" />
            </span>
            <div class="price-keypad" role="group" aria-label="Price keypad">
              ${["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "backspace"].map(key => `<button type="button" class="price-key" data-price-key="${key}" aria-label="${key === "backspace" ? "Delete last digit" : key === "." ? "Decimal point" : key}">${key === "backspace" ? "⌫" : key}</button>`).join("")}
              <button type="button" class="price-key price-clear" data-price-key="clear">Clear price</button>
            </div>
          </div>
        </div>
        <div class="form-row">
          <label class="field">
            <span class="field-label">Where it's served <em>optional</em></span>
            <span class="field-control">
              ${icon("store")}
              <input name="location" type="text" maxlength="140" placeholder="Riverside · Burger joint" />
            </span>
          </label>
        </div>

        <label class="field">
          <span class="field-label">Caption</span>
          <span class="field-control field-control-area">
            <textarea name="caption" rows="3" maxlength="2000" placeholder="What makes this plate special?"></textarea>
          </span>
        </label>


        <p class="form-error" id="reel-error" role="alert" hidden></p>

        <div class="reel-upload-actions">
          <label class="field reel-file-field">
            <span class="field-label">Add reel from your device</span>
            <input name="video" type="file" accept=".mp4,video/mp4" required />
            <span class="form-hint">MP4 video · up to 50 MB</span>
          </label>
          <button class="btn btn-primary" type="submit">
            <span class="btn-text">Publish reel</span>
            <span class="spinner" hidden aria-hidden="true"></span>
          </button>
        </div>
      </form>
    </section>

    <section class="panel">
      <header class="panel-head">
        <h3>Your reels</h3>
        <span class="pill" id="reel-count">${reels.length}</span>
      </header>

      <div class="partner-reels" id="partner-reels"></div>
    </section>
  `;

  const form = view.querySelector("#reel-form");
  const submit = form.querySelector('button[type="submit"]');
  const submitText = submit.querySelector(".btn-text");
  const spinner = submit.querySelector(".spinner");
  const errorBox = view.querySelector("#reel-error");
  const list = view.querySelector("#partner-reels");
  const count = view.querySelector("#reel-count");

  const postedReels = reels.slice();

  function paintReels() {
    count.textContent = String(postedReels.length);
    list.innerHTML = postedReels.length
      ? postedReels.map(reelItemMarkup).join("")
      : '<p class="muted">No reels yet — your first post lands at the top of the diner feed.</p>';
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  const priceInput = form.elements.price;
  const validPrice = value => /^\d{0,6}(\.\d{0,2})?$/.test(value) && (!value || Number(value) <= 100000);
  let previousPrice = "";
  priceInput.addEventListener("input", () => {
    if (validPrice(priceInput.value)) previousPrice = priceInput.value;
    else priceInput.value = previousPrice;
  });
  form.querySelectorAll("[data-price-key]").forEach(button => {
    button.addEventListener("click", () => {
      const key = button.dataset.priceKey;
      const value = key === "clear" ? "" : key === "backspace" ? priceInput.value.slice(0, -1) : priceInput.value + (key === "." && !priceInput.value ? "0." : key);
      if (validPrice(value)) { priceInput.value = value; previousPrice = value; }
      clearError();
    });
  });

  function setBusy(busy) {
    submit.disabled = busy;
    spinner.hidden = !busy;
    submitText.textContent = busy ? "Publishing…" : "Publish reel";
  }

  form.addEventListener("input", clearError);
  const older = document.createElement('button');
  older.type = 'button'; older.className = 'btn btn-ghost'; older.textContent = 'Load older reels';
  list.after(older);
  older.hidden = nextPage === null;
  older.onclick = async () => {
    older.disabled = true;
    try {
      const data = await api(`/reels/mine?page=${nextPage}`);
      postedReels.push(...data.reels); nextPage = data.nextPage;
      older.hidden = nextPage === null; paintReels();
    } catch (error) { toast(error.message, 'error'); }
    finally { older.disabled = false; }
  };
  paintReels();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (submit.disabled) {
      return;
    }

    const file = form.elements.video.files[0];
    const price = priceInput.value.trim();
    if (!file || !/\.mp4$/i.test(file.name) || (file.type && file.type !== "video/mp4")) {
      showError("Choose an MP4 video from your device.");
      return;
    }
    if (!file.size || file.size > 50 * 1024 * 1024) {
      showError("Choose a non-empty MP4 video up to 50 MB.");
      return;
    }
    if (price && (!validPrice(price) || !Number.isFinite(Number(price)))) {
      showError("Enter a price between ₹0 and ₹100,000 with up to two decimal places.");
      return;
    }

    clearError();
    setBusy(true);

    try {
      const data = await api("/reels/upload", {
        method: "POST",
        body: file,
        metadata: {
          dish_name: String(form.elements.dish_name.value).trim(),
          caption: String(form.elements.caption.value).trim(),
          location: String(form.elements.location.value).trim(),
          price: price === "" ? null : Number(price),
        },
      });

      postedReels.unshift(data.reel);
      paintReels();

      form.reset();
      previousPrice = "";
      setBusy(false);
      toast("Reel published — it's live on the diner feed.", "success");
    } catch (error) {
      setBusy(false);

      if (error.status === 401) {
        navigate("/login");
        return;
      }

      showError(error.message || "Could not publish that reel.");
    }
  });
}
