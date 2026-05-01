import express from "express";
import {
  createTicket,
  getTickets,
  replyTicket,
} from "../controllers/ticketController.js";
import { protect, vet } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route cho cả User và Vet
router.get("/", protect, getTickets);
router.post("/", protect, createTicket);

// Route chỉ dành cho Vet/Admin trả lời (Nên tái sử dụng middleware admin, hoặc tạo middleware vet riêng)
router.put("/:id/reply", protect, vet, replyTicket);

export default router;
