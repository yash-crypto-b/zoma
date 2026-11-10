import { escapeHtml } from "./ui.js";
import { createDelivery } from "./delivery.js";

export const rupees = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
const menus = [
  { match: /pizza|margherita|ragù|pasta/i, price: 299, sides: [["Garlic bread", 89, "🥖"], ["Cheese dip", 35, "🧀"], ["Lemon iced tea", 69, "🍋"]] },
  { match: /burger|smash|fries/i, price: 229, sides: [["French fries", 79, "🍟"], ["Extra cheese", 30, "🧀"], ["Cold coffee", 99, "🥤"]] },
  { match: /ramen|noodle|slurp|sushi/i, price: 349, sides: [["Veg dumplings", 119, "🥟"], ["Chilli oil", 25, "🌶️"], ["Peach iced tea", 79, "🍑"]] },
  { match: /dessert|cake|chocolate|sweet|ice cream/i, price: 199, sides: [["Vanilla ice cream", 59, "🍦"], ["Chocolate sauce", 25, "🍫"], ["Strawberries", 49, "🍓"]] },
  { match: /.*/, price: 249, sides: [["Masala fries", 79, "🍟"], ["Fresh salad", 59, "🥗"], ["Sweet lassi", 69, "🥛"]] },
];
export function demoMeal(reel) {
  const menu = menus.find((item) => item.match.test(reel.dish_name || ""));
  return { name: reel.dish_name || "Chef’s special meal", ...menu, price: reel.price === null || reel.price === undefined ? menu.price : Number(reel.price) };
}
export function orderTotal(meal, sides, quantity) {
  const food = (meal.price + meal.sides.reduce((sum, side, index) => sum + (sides.has(index) ? side[1] : 0), 0)) * quantity;
  const tax = Math.round(food * 5) / 100;
  return { food, tax, delivery: 30, total: Math.round((food + tax + 30) * 100) / 100 };
}

export function openOrder(reel) {
  document.querySelector(".order-dialog")?.close();
  const meal = demoMeal(reel);
  const sides = new Set();
  let quantity = 1;
  let timer;
  const trigger = document.activeElement;
  const dialog = document.createElement("dialog");
  dialog.className = "order-dialog";
  dialog.setAttribute("aria-labelledby", "order-title");
  const onRoute = () => dialog.close();
  const close = () => {
    clearInterval(timer);
    window.removeEventListener("hashchange", onRoute);
    dialog.remove();
    if (trigger?.isConnected) trigger.focus();
  };
  dialog.addEventListener("close", close, { once: true });
  window.addEventListener("hashchange", onRoute, { once: true });
  document.body.appendChild(dialog);
  dialog.innerHTML = `
    <button class="order-close" type="button" aria-label="Close order">×</button>
    <span class="order-eyebrow">🍽️ REEL TO REAL CRAVINGS · DEMO</span>
    <h2 id="order-title">Make it your meal</h2>
    <p class="order-muted">${escapeHtml(reel.partner?.name || "Your favourite kitchen")}</p>
    <div class="order-meal"><div><strong>${escapeHtml(meal.name)}</strong><small>Dummy menu · ${rupees(meal.price)} each</small></div><span>😋</span></div>
    <form class="order-form">
      <fieldset><legend>Add a little extra</legend><p class="order-muted">Sides are optional, per meal. Uncheck to remove.</p>
      ${meal.sides.map(([name, price, emoji], index) => `<label class="order-side"><span>${emoji} ${escapeHtml(name)}<small>+ ${rupees(price)}</small></span><input type="checkbox" name="sides" value="${index}"></label>`).join("")}</fieldset>
      <div class="order-quantity"><strong>Meals</strong><div><button type="button" data-minus aria-label="Remove one meal">−</button><output data-quantity>1</output><button type="button" data-plus aria-label="Add one meal">+</button></div></div>
      <label class="order-address">📍 Deliver to<input name="address" required maxlength="180" placeholder="Flat, street and locality" autocomplete="street-address"></label>
      <div class="order-bill" aria-live="polite"></div>
      <fieldset><legend>Choose payment</legend><div class="order-payments">
      <label><input type="radio" name="payment" value="UPI" checked> 📱 UPI</label>
      <label><input type="radio" name="payment" value="Cash on delivery"> 💵 COD</label>
      <label><input type="radio" name="payment" value="Card"> 💳 Card</label></div></fieldset>
      <p class="order-muted">Demo checkout: payments are simulated. No payment details needed.</p>
      <button class="order-submit" type="submit"></button>
    </form>`;
  dialog.querySelector(".order-close").onclick = () => dialog.close();
  const update = () => {
    const bill = orderTotal(meal, sides, quantity);
    dialog.querySelector("[data-quantity]").value = quantity;
    dialog.querySelector("[data-minus]").disabled = quantity === 1;
    dialog.querySelector("[data-plus]").disabled = quantity === 10;
    dialog.querySelector(".order-bill").innerHTML = `<div><span>Meals & sides × ${quantity}</span><span>${rupees(bill.food)}</span></div><div><span>Demo tax (5%)</span><span>${rupees(bill.tax)}</span></div><div><span>Delivery</span><span>${rupees(bill.delivery)}</span></div><div class="order-total"><strong>Total to pay</strong><strong>${rupees(bill.total)}</strong></div>`;
    dialog.querySelector(".order-submit").textContent = `Place demo order · ${rupees(bill.total)}`;
  };
  dialog.querySelectorAll('[name="sides"]').forEach((input) => input.onchange = () => {
    if (input.checked) sides.add(Number(input.value)); else sides.delete(Number(input.value));
    update();
  });
  dialog.querySelector("[data-minus]").onclick = () => { quantity = Math.max(1, quantity - 1); update(); };
  dialog.querySelector("[data-plus]").onclick = () => { quantity = Math.min(10, quantity + 1); update(); };
  dialog.querySelector("form").onsubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const address = String(form.get("address")).trim();
    if (!address) { dialog.querySelector('[name="address"]').focus(); return; }
    const payment = form.get("payment");
    const bill = orderTotal(meal, sides, quantity);
    const { rider, eta, route, roads, parks, start, destination } = createDelivery();
    dialog.innerHTML = `<button class="order-close" type="button" aria-label="Close tracking">×</button>
      <span class="order-eyebrow">✅ DEMO ORDER CONFIRMED</span><h2 id="order-title">Good food is on its way! 🎉</h2>
      <p class="order-muted">${quantity} × ${escapeHtml(meal.name)}${sides.size ? ` · ${[...sides].map((i) => escapeHtml(meal.sides[i][0])).join(", ")}` : ""}</p>
      <div class="order-paid"><strong>${rupees(bill.total)}</strong><span>${payment === "Cash on delivery" ? "Pay on delivery · Cash" : `Demo payment successful · ${escapeHtml(payment)}`}</span></div>
      <div class="delivery-map" role="img" aria-label="Simulated map showing your rider approaching your delivery location">
        <svg viewBox="0 0 400 250" aria-hidden="true"><rect width="400" height="250" fill="#eaf0e7"/><path d="${roads}" stroke="white" stroke-width="16"/>${parks}<path d="${route}" fill="none" stroke="#2c7563" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><text x="${start.x - 14}" y="${start.y + 30}" font-size="23">🍴</text><text x="${destination.x - 16}" y="${destination.y - 9}" font-size="27">🏠</text><g><animateMotion dur="45s" repeatCount="1" fill="freeze" rotate="auto" path="${route}"/><text font-size="27" text-anchor="middle" dy="-8" transform="scale(-1 1)">🛵</text></g></svg>
        <span class="map-label">📍 Simulated delivery map</span>
      </div>
      <div class="order-rider"><span>🧑🏽‍🚀</span><div><strong>${rider}</strong><small>Your delivery partner · 🛵 On the way</small></div><strong data-eta>${eta} min</strong></div>
      <p class="delivery-status" role="status">🍳 Prepared → 🛵 Rider arriving at your location</p>
      <p class="order-muted">📍 ${escapeHtml(address)}</p><p class="order-muted">This is a simulated delivery. No real order or rider is booked.</p>
      <button class="order-submit" type="button" data-done>Keep exploring reels 🍿</button>`;
    dialog.querySelector(".order-close").onclick = () => dialog.close();
    dialog.querySelector("[data-done]").onclick = () => dialog.close();
    let elapsed = 0;
    timer = window.setInterval(() => {
      elapsed += 1;
      dialog.querySelector("[data-eta]").textContent = `${Math.max(1, Math.ceil(eta * (1 - elapsed / 45)))} min`;
      if (elapsed >= 45) {
        clearInterval(timer);
        dialog.querySelector("[data-eta]").textContent = "Arrived";
        dialog.querySelector(".delivery-status").textContent = `🎉 ${rider} has arrived! Enjoy your meal 😋 (demo)`;
      }
    }, 1000);
    dialog.scrollTop = 0;
    dialog.querySelector(".order-close").focus();
  };
  update();
  dialog.showModal();
}
