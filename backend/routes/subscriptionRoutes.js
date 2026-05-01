import express from "express";
import { demoUpgradePlan } from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Bọc bằng protect để biết ai đang đăng nhập
router.post("/demo-upgrade", protect, demoUpgradePlan);

export default router;
