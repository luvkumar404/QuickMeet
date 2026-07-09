import { Router } from "express";
import {
    addToHistory,
    getCurrentUser,
    getUserHistory,
    login,
    register
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getCurrentUser);
router.post("/add_to_activity", authenticate, addToHistory);
router.get("/get_all_activity", authenticate, getUserHistory);

export default router;
