import { api } from "../api.js";
import { demoMeal, openOrder, rupees } from "../order.js";
import { errorState, loadingState } from "../layout.js";
import { escapeHtml, icon, initials, timeAgo, toast } from "../ui.js";

let feedObserver = null;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const formatCount = (value) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value) || 0);

function reelMarkup(reel, index) {
  const partnerName = reel.partner?.name || "Food partner";
  const dish = reel.dish_name || "Fresh plate";
  const liked = reel.liked ? " is-liked" : "";
  const isVideo = reel.media_type === "video";

  const media = isVideo
    ? `<video
          class="reel-media"
          src="${escapeHtml(reel.media_url)}"
          ${reel.poster_url ? `poster="${escapeHtml(reel.poster_url)}"` : ""}
          muted
          loop
          playsinline
          preload="${index === 0 ? "auto" : "metadata"}"
        ></video>`
    : `<img
          class="reel-media"
          src="${escapeHtml(reel.media_url)}"
          alt="${escapeHtml(`${dish} at ${partnerName}`)}"
          loading="${index === 0 ? "eager" : "lazy"}"
          decoding="async"
        />`;

  return `
    <article class="reel" data-index="${index}" data-id="${escapeHtml(reel.id)}" aria-label="${escapeHtml(dish)}" tabindex="-1">
      <div class="reel-card">
        ${media}
        <div class="reel-vignette" aria-hidden="true"></div>

        <header class="reel-top">
          <div class="reel-partner">
            <span class="avatar reel-avatar">${escapeHtml(initials(partnerName))}</span>
            <span class="reel-partner-text">
              <strong>${escapeHtml(partnerName)}</strong>
              <em>${escapeHtml(reel.location || "Food partner")}</em>
            </span>
          </div>
          ${
            isVideo
              ? `<button class="reel-sound" type="button" aria-label="Unmute reel" aria-pressed="false">
                   ${icon("mute", 16)}
                 </button>`
              : ""
          }
        </header>

        <footer class="reel-bottom">
          <div class="reel-dish">
            <h3>${escapeHtml(dish)}</h3>
            ${
              reel.price === null || reel.price === undefined
                ? ""
                : `<span class="reel-price">${escapeHtml(rupees(demoMeal(reel).price))}</span>`
            }
          </div>
          <p class="reel-caption">${escapeHtml(reel.caption || "")}</p>
          <button class="reel-order" type="button">🍽️ Order food · ${rupees(demoMeal(reel).price)}</button>
          <div class="reel-meta">
            <span class="reel-time">${escapeHtml(timeAgo(reel.created_at))}</span>
          </div>
        </footer>
        <div class="reel-actions" aria-label="Reel actions">
            <button
              class="reel-like${liked}"
              type="button"
              aria-pressed="${reel.liked ? "true" : "false"}"
              aria-label="${reel.liked ? "Remove like" : "Like this reel"}"
              data-likes="${Number(reel.likes) || 0}"
            >
              ${icon("heart", 26)}
              <span>${escapeHtml(formatCount(reel.likes))}</span>
            </button>
            <button class="reel-share" type="button" aria-label="Share this reel"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m21 3-7 18-4-7-7-4 18-7Z"/><path d="m10 14 11-11"/></svg><span>Share</span></button>
            ${isVideo ? '<button class="reel-toggle" type="button" aria-label="Play reel">▶<span>Play</span></button>' : ''}
        </div>
        <span class="reel-heart-burst" aria-hidden="true">♥</span>
        ${isVideo ? '<input class="reel-progress" type="range" min="0" max="100" step="0.1" value="0" aria-label="Video position" />' : ''}

        ${isVideo ? `<button class="reel-play" type="button" aria-label="Play reel" hidden>${icon("play", 22)}</button>` : ""}
      </div>
    </article>
  `;
}

function applyLike(button, liked, count) {
  button.classList.toggle("is-liked", liked);
  button.setAttribute("aria-pressed", String(liked));
  button.setAttribute("aria-label", liked ? "Remove like" : "Like this reel");
  button.dataset.likes = String(count);
  button.querySelector("span").textContent = formatCount(count);
}

function wireLike(card, reel) {
  const likeButton = card.querySelector(".reel-like");

  likeButton.addEventListener("click", async (event) => {
    event.stopPropagation();

    if (likeButton.classList.contains("is-busy")) {
      return;
    }

    const wasLiked = likeButton.classList.contains("is-liked");
    const previousCount = Number(likeButton.dataset.likes) || 0;

    applyLike(likeButton, !wasLiked, Math.max(previousCount + (wasLiked ? -1 : 1), 0));
    likeButton.classList.add("is-busy");

    try {
      const data = await api(`/reels/${reel.id}/like`, { method: "POST" });
      applyLike(likeButton, data.liked, data.likes);
    } catch (error) {
      applyLike(likeButton, wasLiked, previousCount);

      if (error.status === 401) {
        likeButton.dispatchEvent(
          new CustomEvent("zomareel:unauthorized", { bubbles: true })
        );
        return;
      }

      toast(error.message || "Couldn't save that like.", "error");
    } finally {
      likeButton.classList.remove("is-busy");
    }
  });
}

function wireReels(view, feed, reels, preview = false) {
  const cards = Array.from(view.querySelectorAll(".reel"));
  const soundControls = new Map();
  let activeIndex = 0;
  const previous = view.querySelector("[data-previous]");
  const next = view.querySelector("[data-next]");
  const go = (index) => {
    const target = cards[Math.max(0, Math.min(index, cards.length - 1))];
    feed.scrollTo({ top: target.offsetTop - feed.offsetTop, behavior: reduceMotion ? "instant" : "smooth" });
  };
  previous.addEventListener("click", () => go(activeIndex - 1));
  next.addEventListener("click", () => go(activeIndex + 1));
  feed.addEventListener("keydown", (event) => {
    if (event.target.matches("input, button")) return;
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault(); go(activeIndex + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.code === "Space") {
      event.preventDefault(); cards[activeIndex].querySelector(".reel-toggle")?.click();
    }
  });

  cards.forEach((card, index) => {
    if (!preview) wireLike(card, reels[index]);
    else {
      card.querySelector(".reel-like").disabled = true;
      card.querySelector(".reel-like").setAttribute("aria-label", "Customer likes");
      card.querySelector(".reel-order").disabled = true;
    }
    card.querySelector(".reel-order").addEventListener("click", (event) => {
      event.stopPropagation();
      cards.forEach((item) => item.querySelector("video")?.pause());
      openOrder(reels[index]);
    });
    card.querySelector(".reel-share").addEventListener("click", async () => {
      const url = new URL(window.location.href);
      url.hash = `/feed?reel=${encodeURIComponent(reels[index].id)}`;
      try {
        await navigator.clipboard.writeText(url.href);
        toast("Reel link copied.", "success");
      } catch { toast("Could not copy the link. Please copy the page address.", "info"); }
    });
    card.querySelector(".reel-media").addEventListener("dblclick", () => {
      const like = card.querySelector(".reel-like");
      if (preview) return;
      if (!like.classList.contains("is-liked")) like.click();
      const burst = card.querySelector(".reel-heart-burst");
      burst.classList.remove("is-visible");
      void burst.offsetWidth;
      burst.classList.add("is-visible");
    });

    const video = card.querySelector("video");
    if (!video) {
      return;
    }

    const playButton = card.querySelector(".reel-play");
    const soundButton = card.querySelector(".reel-sound");
    const toggle = card.querySelector(".reel-toggle");
    const progress = card.querySelector(".reel-progress");

    const syncPlayState = () => {
      playButton.hidden = !video.paused;
      playButton.setAttribute("aria-label", video.paused ? "Play reel" : "Pause reel");
      toggle.innerHTML = `${video.paused ? '▶' : 'Ⅱ'}<span>${video.paused ? 'Play' : 'Pause'}</span>`;
      toggle.setAttribute("aria-label", video.paused ? "Play reel" : "Pause reel");
    };

    video.addEventListener("play", syncPlayState);
    video.addEventListener("pause", syncPlayState);
    syncPlayState();

    card.addEventListener("click", (event) => {
      if (event.target.closest(".reel-actions, .reel-sound, .reel-progress, .reel-order")) {
        return;
      }

      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
    toggle.addEventListener("click", () => {
      if (video.paused) video.play().catch(() => {});
      else video.pause();
    });
    video.addEventListener("timeupdate", () => {
      if (Number.isFinite(video.duration) && video.duration > 0) progress.value = video.currentTime / video.duration * 100;
    });
    progress.addEventListener("input", () => {
      if (Number.isFinite(video.duration)) video.currentTime = Number(progress.value) / 100 * video.duration;
    });
    video.addEventListener("error", () => toast("This video could not load. Try the next reel.", "info"), { once: true });

    const setSound = (on) => {
      video.muted = !on;
      soundButton.innerHTML = icon(on ? "volume" : "mute", 16);
      soundButton.setAttribute("aria-pressed", String(on));
      soundButton.setAttribute("aria-label", on ? "Mute reel" : "Unmute reel");
    };

    soundControls.set(card, setSound);

    soundButton.addEventListener("click", (event) => {
      event.stopPropagation();

      const turningOn = video.muted;
      if (turningOn) {
        soundControls.forEach((control, otherCard) => {
          if (otherCard !== card) {
            control(false);
          }
        });
      }

      setSound(turningOn);
      video.play().catch(() => {});
    });
  });

  feedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          activeIndex = Number(entry.target.dataset.index);
          previous.disabled = activeIndex === 0;
          next.disabled = activeIndex === cards.length - 1;
        }
        const video = entry.target.querySelector("video");
        if (!video) {
          return;
        }

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          if (!reduceMotion && !document.hidden) video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { root: feed, threshold: [0, 0.6] }
  );

  cards.forEach((card) => feedObserver.observe(card));
  const selected = new URLSearchParams(window.location.hash.split("?")[1] || "").get("reel");
  const selectedIndex = reels.findIndex((reel) => String(reel.id) === selected);
  if (selectedIndex > 0) requestAnimationFrame(() => {
    feed.scrollTop = cards[selectedIndex].offsetTop - feed.offsetTop;
  });
  const onVisibility = () => {
    if (document.hidden) cards.forEach((card) => card.querySelector("video")?.pause());
  };
  document.addEventListener("visibilitychange", onVisibility);
  return () => document.removeEventListener("visibilitychange", onVisibility);
}

export async function renderFeed(view, ctx) {
  const { navigate, setTitle, session } = ctx;
  const preview = session?.role === "partner";
  setTitle(preview ? "Menu" : "Feed");

  if (feedObserver) {
    feedObserver.disconnect();
    feedObserver = null;
  }

  view.innerHTML = loadingState("Plating the feed…");

  let reels;
  const page = ctx.page || 0;
  let nextPage = null;

  try {
    const data = await api((preview ? "/reels/mine" : "/reels") + `?page=${page}`);
    nextPage = data.nextPage;
    reels = Array.isArray(data.reels) ? data.reels : [];
    if (preview) reels = reels.map(reel => ({ ...reel, partner: { name: session.profile?.name || session.profile?.email?.split("@")[0] || "Your kitchen" } }));
  } catch (error) {
    if (error.status === 401) {
      navigate("/login");
      return;
    }

    view.innerHTML = errorState(error.message);
    view.querySelector("[data-retry]")?.addEventListener("click", () =>
      renderFeed(view, ctx)
    );
    return;
  }

  if (reels.length === 0) {
    view.innerHTML = `
      <div class="state-card">
        <span class="state-icon">${icon("spark", 22)}</span>
        <h2>${preview ? "Your menu is still empty" : "The feed is still empty"}</h2>
        <p>${preview ? "Publish a reel from your kitchen to see it here." : "New dishes will appear here when kitchens share their posts."}</p>
        ${preview ? '<a class="btn btn-primary" href="#/partner">Back to kitchen</a>' : ""}
      </div>
    `;
    return;
  }

  view.innerHTML = `
    <section class="reels-experience" aria-label="Food reels">
    <div class="reels-toolbar"><div><span class="reels-live-dot"></span><strong>${preview ? "Your published menu · Customer preview" : "Fresh from the kitchens"}</strong></div><button class="btn btn-ghost" type="button" data-refresh-feed>Refresh feed</button></div>
    <div class="reels-stage">
    <div class="feed" id="feed" tabindex="0" aria-label="Reels. Use up and down arrow keys to browse, space to play or pause.">
      ${reels.map(reelMarkup).join("")}
    </div>
    <div class="reels-navigation"><button type="button" data-previous aria-label="Previous reel" disabled>↑</button><button type="button" data-next aria-label="Next reel" ${reels.length === 1 ? 'disabled' : ''}>↓</button></div>
    </div>
    <div class="reels-toolbar"><button class="btn btn-ghost" data-newer-page ${page === 0 ? "disabled" : ""}>Newer reels</button><button class="btn btn-ghost" data-older-page ${nextPage === null ? "disabled" : ""}>Older reels</button></div>
    <p class="reels-hint">Scroll to discover <span>·</span> ${preview ? "Your published reels" : "Double-click to like"} <span>·</span> Space to pause</p>
    </section>
  `;

  view.querySelector("[data-refresh-feed]").addEventListener("click", () => navigate(preview ? "/menu" : "/feed"));
  view.querySelector('[data-newer-page]').onclick = () => renderFeed(view, { ...ctx, page: page - 1 });
  view.querySelector('[data-older-page]').onclick = () => renderFeed(view, { ...ctx, page: nextPage });
  const feed = view.querySelector("#feed");
  const cleanup = wireReels(view, feed, reels, preview);

  view.addEventListener("zomareel:unauthorized", () => navigate("/login"), {
    once: true,
  });

  // Leaving the feed must stop playback and the visibility observer.
  const stopPlayback = () => {
    cleanup?.();
    if (feedObserver) {
      feedObserver.disconnect();
      feedObserver = null;
    }

    view.querySelectorAll("video").forEach((video) => video.pause());
    window.removeEventListener("hashchange", stopPlayback);
  };

  window.addEventListener("hashchange", stopPlayback);
}
