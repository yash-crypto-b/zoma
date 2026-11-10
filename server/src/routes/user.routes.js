import express from "express";
import userController from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

import { validate, profileSchema } from "../middleware/validation.js";

import { limiter } from '../middleware/security.js';
const profileLimit = limiter({ limit: 20, windowMs: 900000, name: 'profile_update', key: req => String(req.userId) });
const router = express.Router();

router.get("/me", authMiddleware, userController.getUser);
router.patch("/me", authMiddleware, profileLimit, validate(profileSchema), userController.updateUser);

export default router;
