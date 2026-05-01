import express from "express";
import { addReview, getReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getReviews); // Public: Ai cũng xem được
router.post("/", protect, addReview); // Protected: Phải đăng nhập mới được review

export default router;
