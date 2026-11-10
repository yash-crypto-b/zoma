import pool from "../DB/db.js";

const createUserTable = async () => {
  const query = `CREATE TABLE IF NOT EXISTS users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  try {
    await pool.query(query);
    console.log("User table verified/created successfully");
  } catch (error) {
    console.error("error creating user table:", error.message);
    throw error;
  }
};

export default createUserTable;
