import pool from "../DB/db.js";

const FEED_QUERY = `
  SELECT
    r.id,
    r.dish_name,
    r.caption,
    r.location,
    r.price,
    r.media_type,
    r.media_url,
    r.poster_url,
    r.likes,
    r.created_at,
    p.id AS partner_id,
    p.name AS partner_name,
    EXISTS (
      SELECT 1 FROM reel_likes l WHERE l.reel_id = r.id AND l.user_id = $1
    ) AS liked
  FROM reels r
  JOIN food_partners p ON p.id = r.food_partner_id
  ORDER BY r.created_at DESC, r.id DESC
  LIMIT 100 OFFSET $2
`;

const shapeReel = (row) => ({
  id: row.id,
  dish_name: row.dish_name,
  caption: row.caption,
  location: row.location,
  price: row.price === null ? null : Number(row.price),
  media_type: row.media_type,
  media_url: row.media_url,
  poster_url: row.poster_url,
  likes: row.likes,
  created_at: row.created_at,
  liked: row.liked === true,
  partner: { id: row.partner_id, name: row.partner_name },
});

// Public feed. Signed-in diners also get their own liked flags.
const getReels = async (req, res) => {
  try {
    const result = await pool.query(FEED_QUERY, [req.userId ?? null, (req.page || 0) * 100]);

    return res.status(200).json({
      success: true,
      nextPage: result.rows.length === 100 ? (req.page || 0) + 1 : null,
      reels: result.rows.map(shapeReel),
    });
  } catch (error) {
    console.error("get reels error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const MAX_TEXT = 2000;
const MAX_URL = 2000;

const parseText = (value, max = MAX_TEXT) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, max);
};

const parseMediaUrl = (value) => {
  if (typeof value !== "string" || !value.trim() || value.length > MAX_URL) {
    return null;
  }

  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
};

const parsePrice = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return { price: null };
  }

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0 || price > 100000) {
    return { error: "price must be a number between 0 and 100000" };
  }

  return { price: Math.round(price * 100) / 100 };
};

const getMyReels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, dish_name, caption, location, price, media_type, media_url,
              poster_url, likes, created_at
       FROM reels
       WHERE food_partner_id = $1
       ORDER BY created_at DESC, id DESC LIMIT 100 OFFSET $2`,
      [req.foodpartner.id, (req.page || 0) * 100]
    );

    return res.status(200).json({
      success: true,
      nextPage: result.rows.length === 100 ? (req.page || 0) + 1 : null,
      reels: result.rows.map((row) => ({
        ...row,
        price: row.price === null ? null : Number(row.price),
      })),
    });
  } catch (error) {
    console.error("get partner reels error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const createReel = async (req, res) => {
  const body = req.body ?? {};

  const mediaUrl = req.uploadedMedia || parseMediaUrl(body.media_url);
  if (!mediaUrl) {
    return res.status(400).json({
      success: false,
      message: "media_url must be a public http(s) link",
    });
  }

  const mediaType = body.media_type === "video" ? "video" : "image";

  let posterUrl = null;
  if (mediaType === "video" && body.poster_url) {
    posterUrl = parseMediaUrl(body.poster_url);
    if (!posterUrl) {
      return res.status(400).json({
        success: false,
        message: "poster_url must be a public http(s) link",
      });
    }
  }

  const dishName = parseText(body.dish_name, 140) || null;
  const caption = parseText(body.caption, MAX_TEXT) || null;
  const location = parseText(body.location, 140) || null;

  const { price, error: priceError } = parsePrice(body.price);
  if (priceError) {
    return res.status(400).json({ success: false, message: priceError });
  }

  try {
    const result = await pool.query(
      `INSERT INTO reels (
         food_partner_id, dish_name, caption, location, price,
         media_type, media_url, poster_url, likes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0)
       RETURNING id, dish_name, caption, location, price, media_type,
                 media_url, poster_url, likes, created_at`,
      [
        req.foodpartner.id,
        dishName,
        caption,
        location,
        price,
        mediaType,
        mediaUrl,
        posterUrl,
      ]
    );

    const row = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "reel published",
      reel: {
        ...row,
        price: row.price === null ? null : Number(row.price),
        partner: { id: req.foodpartner.id, name: req.foodpartner.name },
      },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "that photo or video is already on the feed",
      });
    }

    console.error("create reel error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const toggleLike = async (req, res) => {
  const reelId = Number(req.params.id);

  if (!Number.isInteger(reelId) || reelId <= 0) {
    return res.status(400).json({
      success: false,
      message: "invalid reel id",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const exists = await client.query("SELECT 1 FROM reels WHERE id = $1 FOR UPDATE", [
      reelId,
    ]);

    if (exists.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "reel not found",
      });
    }

    const removed = await client.query(
      "DELETE FROM reel_likes WHERE user_id = $1 AND reel_id = $2",
      [req.userId, reelId]
    );

    const liked = removed.rowCount === 0;

    if (liked) {
      await client.query(
        "INSERT INTO reel_likes (user_id, reel_id) VALUES ($1, $2)",
        [req.userId, reelId]
      );
    }

    const updated = await client.query(
      `UPDATE reels
       SET likes = GREATEST(likes + $2, 0)
       WHERE id = $1
       RETURNING likes`,
      [reelId, liked ? 1 : -1]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      liked,
      likes: updated.rows[0].likes,
    });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("toggle reel like error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  } finally {
    client.release();
  }
};

export default { getReels, getMyReels, createReel, toggleLike };
