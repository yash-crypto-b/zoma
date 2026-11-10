const CACHE_KEY = 'zomareel.demo-deliveries.v1';
const riders = ['Aarav Sharma', 'Rohan Patel', 'Arjun Singh', 'Vikram Nair', 'Rahul Verma', 'Karthik Kumar', 'Aditya Joshi', 'Imran Khan', 'Suresh Yadav', 'Deepak Rao'];
let history = [];

export function createDelivery() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (Array.isArray(cached)) history = cached.filter(item => item && Number.isInteger(item.riderIndex) && item.riderIndex >= 0 && item.riderIndex < riders.length && Number.isInteger(item.mapSeed)).slice(-20);
  } catch { /* Storage may be unavailable or contain invalid JSON. */ }
  const recent = history.slice(-(riders.length - 1));
  const available = riders.map((_, index) => index).filter(index => !recent.some(item => item.riderIndex === index));
  const riderIndex = available[Math.floor(Math.random() * available.length)];
  let mapSeed = Math.floor(Math.random() * 4294967296);
  if (mapSeed === history.at(-1)?.mapSeed) mapSeed = (mapSeed + 1) >>> 0;
  const delivery = { id: crypto.randomUUID(), createdAt: Date.now(), riderIndex, mapSeed, eta: 12 + Math.floor(Math.random() * 9) };
  history = [...history, delivery].slice(-20);
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(history)); } catch { /* Keep rotation working in memory. */ }
  return { ...delivery, rider: riders[riderIndex], ...createMap(mapSeed) };
}

// A cached seed reproduces the same map without trusting stored SVG markup.
export function createMap(seed) {
  let state = seed >>> 0;
  const between = (min, max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return min + Math.floor((state / 4294967296) * (max - min + 1));
  };
  const xs = [between(30, 50), between(95, 125), between(175, 200), between(250, 280), between(335, 365)];
  const ys = [between(45, 65), between(110, 140), between(185, 205)];
  const route = `M ${xs[0]} ${ys[2]} L ${xs[1]} ${ys[2]} L ${xs[1]} ${ys[1]} L ${xs[3]} ${ys[1]} L ${xs[3]} ${ys[0]} L ${xs[4]} ${ys[0]}`;
  const roads = [...ys.map(y => `M0 ${y}H400`), ...xs.map(x => `M${x} 0V250`)].join('');
  const parks = [1, 3].map((column, index) => {
    const row = index;
    return `<rect x="${xs[column] + 13}" y="${ys[row] + 13}" width="${xs[column + 1] - xs[column] - 26}" height="${ys[row + 1] - ys[row] - 26}" rx="8" fill="#c6dcb7"/>`;
  }).join('');
  return { route, roads, parks, start: { x: xs[0], y: ys[2] }, destination: { x: xs[4], y: ys[0] } };
}
