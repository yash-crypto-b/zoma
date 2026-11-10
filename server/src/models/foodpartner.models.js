import pool from "../DB/db.js";

const createFoodPartnerTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS food_partners(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  try {
    await pool.query(query);
    console.log("Food partner table verified/created successfully");
  } catch (error) {
    console.error("error creating food partner table:", error.message);
    throw error;
  }
};

export default createFoodPartnerTable;
