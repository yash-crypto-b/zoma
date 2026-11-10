import pool from "../DB/db.js";
import bcrypt from "bcryptjs";
import { issueSession } from "../middleware/session.js";

// manage operations related to the user
const getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1",
      [userId]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "user exists",
      user,
    });
  } catch (error) {
    console.error("user error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body ?? {};

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        success: false,
        message: "nothing to update",
      });
    }

    if (name !== undefined && name !== null && (typeof name !== "string" || name.trim().length > 100)) {
      return res.status(400).json({
        success: false,
        message: "name must be a string",
      });
    }

    if (
      email !== undefined &&
      (typeof email !== "string" || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "email must be a non-empty string",
      });
    }

    if (email !== undefined) {
      const { rows: [existing] } = await pool.query('SELECT email, password FROM users WHERE id = $1', [userId]);
      if (!existing) return res.status(401).json({ success: false, message: 'invalid login' });
      if (email.trim().toLowerCase() !== existing.email &&
          (typeof req.body.currentPassword !== 'string' || !await bcrypt.compare(req.body.currentPassword, existing.password))) {
        return res.status(403).json({ success: false, message: 'current password required to change email' });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           updated_at = GREATEST(updated_at, clock_timestamp()::timestamp)
       WHERE id = $3
       RETURNING id, name, email, created_at, updated_at`,
      [
        typeof name === "string" && name.trim() ? name.trim() : null,
        typeof email === "string" && email.trim()
          ? email.trim().toLowerCase()
          : null,
        userId,
      ]
    );
    const updatedUser = result.rows[0];

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    const token = await issueSession(res, { userId: updatedUser.id, email: updatedUser.email });
    return res.status(200).json({
      ...(req.headers.authorization ? { token } : {}),
      success: true,
      message: "user updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "email already in use",
      });
    }

    console.error("user update error:", error.code || error.name);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

export default { getUser, updateUser };
