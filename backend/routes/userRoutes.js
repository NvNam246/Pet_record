import express from "express";
import {
  getAllUsers,
  updateUserRole,
  updateUserProfile,
  deleteUser,
  getMe,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. CÁC ROUTE TĨNH (STATIC) ĐẶT LÊN TRÊN CÙNG
router.get("/me", protect, getMe);
router.put("/profile", protect, updateUserProfile);
router.get("/", protect, admin, getAllUsers);

// 2. CÁC ROUTE ĐỘNG CÓ CHỨA PARAM (/:id) ĐẶT XUỐNG DƯỚI
router.put("/:id/role", protect, admin, updateUserRole);
router.delete("/:id", protect, admin, deleteUser);

export default router;
