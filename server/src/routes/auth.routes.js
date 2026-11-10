import express from "express";
import authControllers from "../controllers/auth.controllers.js";

import { authGuard } from '../middleware/auth-validation.js';
const router = express.Router();
router.use(authGuard);

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.post("/logout", authControllers.logout);


router.post("/registerFoodpartner", authControllers.registerFoodpartner);
router.post("/loginFoodpartner", authControllers.loginFoodpartner);

export default router;
