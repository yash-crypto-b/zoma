import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import pool from '../src/DB/db.js';

test('device MP4 publishing validates uploads and serves saved video', async () => {
  const original = pool.query;
  const published = [];
  pool.query = async (sql, values) => {
    if (sql.includes('FROM food_partners')) return { rows: [{ id: 1, name: 'Kitchen', cutoff: 0 }] };
    if (sql.includes('INSERT INTO reels')) {
      const row = { id: 1, dish_name: values[1], caption: values[2], location: values[3], price: values[4], media_url: values[6], media_type: values[5], partner_id: values[0], partner_name: 'Kitchen' };
      published.unshift(row);
      return { rows: [row] };
    }
    if (sql.includes('FROM reels r')) return { rows: published };
    throw new Error('Unexpected query');
  };
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = jwt.sign({ partnerId: 1, authTime: Date.now() }, process.env.JWT_SECRET, { issuer: 'zomareel', audience: 'zomareel-api', expiresIn: '1h' });
  const video = await readFile(new URL('../../client/assets/img/reel-pizza.mp4', import.meta.url));
  let saved;
  const upload = (body, metadata = { dish_name: 'Pizza', price: 199.50 }, auth = true) => fetch(`${base}/api/reels/upload`, {
    method: 'POST', headers: { 'Content-Type': 'video/mp4', 'X-Reel-Metadata': encodeURIComponent(JSON.stringify(metadata)), ...(auth ? { Authorization: `Bearer ${token}` } : {}) }, body,
  });
  try {
    assert.equal((await upload(video, {}, false)).status, 401);
    assert.equal((await upload(Buffer.from('not an mp4'))).status, 400);
    assert.equal((await upload(video, { price: -1 })).status, 400);
    const response = await upload(video);
    assert.equal(response.status, 201);
    const { reel } = await response.json(); saved = reel.media_url;
    assert.equal(reel.price, 199.50);
    assert.equal(reel.media_type, 'video');
    const feedResponse = await fetch(`${base}/api/reels`);
    assert.equal(feedResponse.status, 200);
    const { reels } = await feedResponse.json();
    assert.equal(reels[0].media_url, saved);
    assert.equal(reels[0].dish_name, 'Pizza');
    assert.equal(reels[0].price, 199.50);
    assert.deepEqual(reels[0].partner, { id: 1, name: 'Kitchen' });
    const playback = await fetch(base + saved, { headers: { Range: 'bytes=0-11' } });
    assert.equal(playback.status, 206);
    assert.equal(playback.headers.get('content-type'), 'video/mp4');
    assert.deepEqual(Buffer.from(await playback.arrayBuffer()), video.subarray(0, 12));
  } finally {
    pool.query = original;
    if (saved) await unlink(new URL(saved.slice(1), new URL('../', import.meta.url))).catch(() => {});
    await new Promise(resolve => server.close(resolve));
    await pool.end();
  }
});
