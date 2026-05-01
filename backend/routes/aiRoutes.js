import express from "express";
import { getHealthInsights } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

// 👉 IMPORT Ổ KHÓA CỦA CHÚNG TA VÀO!
import { planGate } from "../middleware/planMiddleware.js";

const router = express.Router();

// Chỉ người dùng gói Professional trở lên (có cờ hasAI = true) mới được xài
router.post("/insights", protect, planGate("hasAI"), getHealthInsights);

export default router;
