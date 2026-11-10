import pool from "../DB/db.js";
import bcrypt from "bcryptjs";

import { issueSession, cookieOptions, authenticate } from '../middleware/session.js';
const COOKIE_NAME = 'token';

// Equal bcrypt work for unknown users limits account enumeration by timing.
const dummyHash = await bcrypt.hash('not-a-real-account-password', 10);
const normalizeEmail = (email) => email.trim().toLowerCase();

const optionalName = (name) =>
  typeof name === "string" && name.trim() ? name.trim() : null;

const register = async function (req, res) {
  const { name, email, password } = req.body ?? {};

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 12 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [optionalName(name), normalizeEmail(email), hashedPassword]
    );
    const user = result.rows[0];

    const token = await issueSession(res, { userId: user.id, email: user.email });

    return res.status(201).json({
      success: true,
      message: "user registered successfully",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "email already registered",
      });
    }

    console.error("Register error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async function (req, res) {
  const { email, password } = req.body ?? {};

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = $1",
      [normalizeEmail(email)]
    );
    const user = result.rows[0];

    if (!user) {
      await bcrypt.compare(password, dummyHash);
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const token = await issueSession(res, { userId: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      message: "login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const logout = async function (req, res) {
  try {
    // Persist revocation in PostgreSQL; all sessions for this identity are signed out.
    let identity;
    try { identity = await authenticate(req); } catch (error) {
      if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError', 'InvalidSession'].includes(error.name)) throw error;
    }
    if (identity) {
      const table = identity.role === 'user' ? 'users' : 'food_partners';
      await pool.query(`UPDATE ${table} SET updated_at = GREATEST(updated_at, clock_timestamp()::timestamp) WHERE id = $1`, [identity.id]);
    }
    const { maxAge, ...clearOptions } = cookieOptions();
    res.clearCookie(COOKIE_NAME, clearOptions);

    return res.status(200).json({
      success: true,
      message: "logout successfully",
    });
  } catch (error) {
    console.error("logout error", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const registerFoodpartner = async function (req, res) {
  const { name, email, password } = req.body ?? {};

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    if (password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "password must be at least 12 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO food_partners (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [optionalName(name), normalizeEmail(email), hashedPassword]
    );
    const partner = result.rows[0];

    const token = await issueSession(res, { partnerId: partner.id, email: partner.email });


    return res.status(201).json({
      success: true,
      message: "food partner registered successfully",
      token,
      foodPartner: { id: partner.id, name: partner.name, email: partner.email },
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "email already registered",
      });
    }

    console.error("Register foodpartner error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "error registering the food partner",
    });
  }
};

const loginFoodpartner = async function (req, res) {
  const { email, password } = req.body ?? {};

  try {
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, password FROM food_partners WHERE email = $1",
      [normalizeEmail(email)]
    );
    const partner = result.rows[0];

    if (!partner) {
      await bcrypt.compare(password, dummyHash);
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "invalid email or password",
      });
    }

    const token = await issueSession(res, { partnerId: partner.id, email: partner.email });


    return res.status(200).json({
      success: true,
      message: "food partner login successful",
      token,
      foodPartner: { id: partner.id, name: partner.name, email: partner.email },
    });
  } catch (error) {
    console.error("Login foodpartner error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default {
  register,
  login,
  logout,
  registerFoodpartner,
  loginFoodpartner,
};
