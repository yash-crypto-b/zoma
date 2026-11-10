import { mkdir, writeFile, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import reelController from "../controllers/reel.controller.js";
import {
  authFoodpartnerMiddleware,
  authMiddleware,
  optionalAuthMiddleware,
} from "../middleware/auth.middleware.js";

import { validate, reelSchema, validatePaging } from '../middleware/validation.js';
import { limiter } from '../middleware/security.js';
const uploadLimit = limiter({ limit: 10, windowMs: 3600000, name: 'upload', key: req => String(req.foodpartner.id) });
let activeUploads = 0;
const uploadConcurrency = (req, res, next) => {
  if (activeUploads >= 2) return res.status(503).json({ success: false, message: 'upload capacity reached' });
  activeUploads++;
  let released = false;
  const release = () => { if (!released) { released = true; activeUploads--; } };
  res.once('finish', release); res.once('close', release);
  next();
};
const router = express.Router();

router.get("/", validatePaging, optionalAuthMiddleware, reelController.getReels);
router.get("/mine", authFoodpartnerMiddleware, validatePaging, reelController.getMyReels);
router.post("/upload", authFoodpartnerMiddleware, uploadLimit, uploadConcurrency, express.raw({ type: "video/mp4", limit: "50mb" }), async (req, res, next) => {
  const video = req.body;
  // ISO base media files identify their container with an ftyp box.
  if (!Buffer.isBuffer(video) || video.length < 12 || video.toString("ascii", 4, 8) !== "ftyp") {
    return res.status(400).json({ success: false, message: "Choose a valid MP4 video." });
  }
  let metadata;
  try {
    metadata = JSON.parse(decodeURIComponent(req.get("X-Reel-Metadata") || ""));
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) throw new Error();
  } catch {
    return res.status(400).json({ success: false, message: "Invalid reel details." });
  }
  const parsed = reelSchema.safeParse(metadata);
  if (!parsed.success) return res.status(400).json({ success: false, message: 'invalid reel details' });
  metadata = parsed.data;
  const directory = fileURLToPath(new URL("../../uploads/", import.meta.url));
  const filename = `${randomUUID()}.mp4`;
  const filepath = `${directory}/${filename}`;
  try {
    await mkdir(directory, { recursive: true });
    await writeFile(filepath, video, { flag: "wx" });
    req.uploadedMedia = `/uploads/${filename}`;
    req.body = { ...metadata, media_type: "video", poster_url: "" };
    res.on("finish", () => {
      if (res.statusCode !== 201) unlink(filepath).catch(() => {});
    });
    return reelController.createReel(req, res);
  } catch (error) {
    await unlink(filepath).catch(() => {});
    next(error);
  }
});
router.post("/", authFoodpartnerMiddleware, validate(reelSchema), reelController.createReel);
router.post("/:id/like", authMiddleware, (req, res, next) => {
  if (!/^[1-9]\d{0,9}$/.test(req.params.id) || Number(req.params.id) > 2147483647) return res.status(400).json({ success: false, message: 'invalid reel id' });
  next();
}, reelController.toggleLike);

export default router;
