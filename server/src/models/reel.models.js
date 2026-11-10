import pool from "../DB/db.js";

const createReelsTable = async () => {
  const reelsQuery = `CREATE TABLE IF NOT EXISTS reels(
    id SERIAL PRIMARY KEY,
    food_partner_id INTEGER NOT NULL REFERENCES food_partners(id) ON DELETE CASCADE,
    dish_name VARCHAR(140),
    caption TEXT,
    location VARCHAR(140),
    price NUMERIC(10, 2),
    media_type VARCHAR(10) NOT NULL DEFAULT 'image',
    media_url TEXT NOT NULL,
    poster_url TEXT,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reels_media_type_check CHECK (media_type IN ('image', 'video'))
    )`;

  const likesQuery = `CREATE TABLE IF NOT EXISTS reel_likes(
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reel_id INTEGER NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, reel_id)
    )`;

  try {
    await pool.query(reelsQuery);
    await pool.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS reels_media_url_key ON reels(media_url)"
    );
    await pool.query(likesQuery);
    console.log("Reels tables verified/created successfully");
  } catch (error) {
    console.error("error creating reels tables:", error.message);
    throw error;
  }
};

export default createReelsTable;
