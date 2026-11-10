import "../env.js";
import bcrypt from "bcryptjs";
import pool from "./db.js";

// Demo credentials for every seeded account.
const DEMO_PASSWORD = process.env.SEED_PASSWORD;
if (process.env.NODE_ENV === 'production' || !DEMO_PASSWORD || DEMO_PASSWORD.length < 12) {
  throw new Error('Seeding requires development mode and SEED_PASSWORD of at least 12 characters');
}

const PEXELS = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=1600&fit=crop`;

const MIXKIT_VIDEO = (id) => `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`;
const MIXKIT_POSTER = (id) =>
  `https://assets.mixkit.co/videos/${id}/${id}-thumb-720-0.jpg`;

const DINERS = [
  { name: "Ada Mensah", email: "ada@zomareel.test" },
  { name: "Marco Ruiz", email: "marco@zomareel.test" },
  { name: "Priya Nair", email: "priya@zomareel.test" },
  { name: "Sam Okafor", email: "sam@zomareel.test" },
];

// ageMinutes keeps the feed looking freshly posted.
const PARTNERS = [
  {
    name: "Nonna's Wood Oven",
    email: "nonna@zomareel.test",
    reels: [
      {
        dish: "Margherita DOP",
        caption:
          "72-hour cold-fermented dough, San Marzano tomatoes, fior di latte — 90 seconds in the wood oven.",
        location: "Little Italy · Wood-fired pizzeria",
        price: 14,
        likes: 1284,
        ageMinutes: 45,
        media_type: "image",
        media: PEXELS(10260552),
      },
      {
        dish: "Sunday Ragù",
        caption:
          "Six hours of beef and pork ragù, grated parmigiano at the table. Sundays only.",
        location: "Little Italy · Wood-fired pizzeria",
        price: 19,
        likes: 862,
        ageMinutes: 190,
        media_type: "video",
        media: MIXKIT_VIDEO(12171),
        poster: MIXKIT_POSTER(12171),
      },
      {
        dish: "Mise en place",
        caption:
          "Every San Marzano gets sliced the same way. This is the calm before service.",
        location: "Little Italy · Wood-fired pizzeria",
        price: null,
        likes: 431,
        ageMinutes: 610,
        media_type: "video",
        media: MIXKIT_VIDEO(40534),
        poster: MIXKIT_POSTER(40534),
      },
    ],
  },
  {
    name: "Smash & Sesame",
    email: "smash@zomareel.test",
    reels: [
      {
        dish: "Black Sesame Smash",
        caption:
          "Two smashed patties, black sesame bun, house pickles. Gloves optional.",
        location: "Riverside · Burger joint",
        price: 11.5,
        likes: 2410,
        ageMinutes: 25,
        media_type: "video",
        media: MIXKIT_VIDEO(3553),
        poster: MIXKIT_POSTER(3553),
      },
      {
        dish: "Duck-fat fries",
        caption: "Triple-cooked in duck fat, finished with flaky sea salt.",
        location: "Riverside · Burger joint",
        price: 5,
        likes: 1508,
        ageMinutes: 320,
        media_type: "video",
        media: MIXKIT_VIDEO(3549),
        poster: MIXKIT_POSTER(3549),
      },
      {
        dish: "Loaded Jalapeño Fries",
        caption:
          "Cheese sauce, pickled jalapeños, crispy onions, and absolutely no sharing.",
        location: "Riverside · Burger joint",
        price: 8,
        likes: 947,
        ageMinutes: 1420,
        media_type: "image",
        media: PEXELS(12557546),
      },
    ],
  },
  {
    name: "Tokyo Slurp Bar",
    email: "tokyo@zomareel.test",
    reels: [
      {
        dish: "Tonkotsu 18h",
        caption:
          "Eighteen hours of pork bones, thin noodles, a jammy egg. Slurp loudly — it's polite here.",
        location: "East Market · Ramen counter",
        price: 17,
        likes: 3162,
        ageMinutes: 75,
        media_type: "image",
        media: PEXELS(10950869),
      },
    ],
  },
  {
    name: "Casa Saffron",
    email: "casa@zomareel.test",
    reels: [
      {
        dish: "Kesar Pulao",
        caption:
          "Saffron rice steamed with cashews and peas, finished under a pastry lid.",
        location: "Old Town · North Indian kitchen",
        price: 13,
        likes: 784,
        ageMinutes: 260,
        media_type: "image",
        media: PEXELS(12669168),
      },
    ],
  },
  {
    name: "Sugar & Crumb Bakehouse",
    email: "crumb@zomareel.test",
    reels: [
      {
        dish: "Cookies & Cream Donut",
        caption: "Brioche donut, vanilla glaze, crushed cookies. Still warm at 8am.",
        location: "Baker Street · Bakehouse",
        price: 4.5,
        likes: 1904,
        ageMinutes: 100,
        media_type: "video",
        media: MIXKIT_VIDEO(40834),
        poster: MIXKIT_POSTER(40834),
      },
      {
        dish: "Buttermilk Stack",
        caption: "Three buttermilk pancakes, maple, and a squeeze of orange.",
        location: "Baker Street · Bakehouse",
        price: 9.5,
        likes: 1120,
        ageMinutes: 510,
        media_type: "image",
        media: PEXELS(10925765),
      },
    ],
  },
  {
    name: "Ember & Vine",
    email: "ember@zomareel.test",
    reels: [
      {
        dish: "The chef's table",
        caption:
          "Bread, a glass of red, and the good cutlery. Setting the table is half the meal.",
        location: "Harbour Lane · Wine kitchen",
        price: null,
        likes: 643,
        ageMinutes: 380,
        media_type: "video",
        media: MIXKIT_VIDEO(12166),
        poster: MIXKIT_POSTER(12166),
      },
      {
        dish: "Patio suppers",
        caption: "Summer menu on the patio — salads, candles, and nowhere to be.",
        location: "Harbour Lane · Wine kitchen",
        price: null,
        likes: 528,
        ageMinutes: 1600,
        media_type: "image",
        media: PEXELS(13350111),
      },
    ],
  },
  {
    name: "Night Owl Coffee",
    email: "nightowl@zomareel.test",
    reels: [
      {
        dish: "Double shot, 6am",
        caption: "Single-origin Ethiopian, pulled tight. The morning shift runs on this.",
        location: "Station Road · Coffee bar",
        price: 3.2,
        likes: 1487,
        ageMinutes: 15,
        media_type: "video",
        media: MIXKIT_VIDEO(41865),
        poster: MIXKIT_POSTER(41865),
      },
      {
        dish: "The 6:15 cortado",
        caption: "Equal parts espresso and steamed milk, in the cup we've used since day one.",
        location: "Station Road · Coffee bar",
        price: 4,
        likes: 692,
        ageMinutes: 980,
        media_type: "image",
        media: PEXELS(12265177),
      },
    ],
  },
  {
    name: "Street Bites Collective",
    email: "streetbites@zomareel.test",
    reels: [
      {
        dish: "Night market haul",
        caption:
          "Twelve stalls, one bench. Dumplings, fried chicken and something we still can't name.",
        location: "Night Market · Street food",
        price: null,
        likes: 2054,
        ageMinutes: 220,
        media_type: "image",
        media: PEXELS(11905679),
      },
    ],
  },
];

async function seedUsers(passwordHash) {
  let added = 0;

  for (const diner of DINERS) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [diner.name, diner.email, passwordHash]
    );
    added += result.rowCount;
  }

  return added;
}

async function upsertPartner(partner, passwordHash) {
  const inserted = await pool.query(
    `INSERT INTO food_partners (name, email, password)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    [partner.name, partner.email, passwordHash]
  );

  if (inserted.rowCount > 0) {
    return { id: inserted.rows[0].id, created: true };
  }

  const existing = await pool.query(
    "SELECT id FROM food_partners WHERE email = $1",
    [partner.email]
  );

  return { id: existing.rows[0].id, created: false };
}

async function seedPartners(passwordHash) {
  let partnersAdded = 0;
  let reelsAdded = 0;

  for (const partner of PARTNERS) {
    const { id, created } = await upsertPartner(partner, passwordHash);
    if (created) {
      partnersAdded += 1;
    }

    for (const reel of partner.reels) {
      const result = await pool.query(
        `INSERT INTO reels (
           food_partner_id, dish_name, caption, location, price,
           media_type, media_url, poster_url, likes, created_at
         )
         VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           CURRENT_TIMESTAMP - ($10 || ' minutes')::interval
         )
         ON CONFLICT (media_url) DO NOTHING`,
        [
          id,
          reel.dish,
          reel.caption,
          reel.location,
          reel.price,
          reel.media_type,
          reel.media,
          reel.poster ?? null,
          reel.likes,
          String(reel.ageMinutes),
        ]
      );
      reelsAdded += result.rowCount;
    }
  }

  return { partnersAdded, reelsAdded };
}

async function seed() {

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const usersAdded = await seedUsers(passwordHash);
  const { partnersAdded, reelsAdded } = await seedPartners(passwordHash);

  const totals = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM users) AS users,
       (SELECT COUNT(*) FROM food_partners) AS partners,
       (SELECT COUNT(*) FROM reels) AS reels`
  );

  console.log(
    `Seeded ${usersAdded} diners, ${partnersAdded} restaurants and ${reelsAdded} reels.`
  );
  console.log(
    `Database now holds ${totals.rows[0].users} users, ${totals.rows[0].partners} restaurants, ${totals.rows[0].reels} reels.`
  );

}

seed()
  .catch((error) => {
    console.error("seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
