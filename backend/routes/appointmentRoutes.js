import express from "express";
import {
  createAppointment,
  getUserAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointmentByCustomer,
} from "../controllers/appointmentController.js";
import { protect, admin, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ROUTE DÀNH CHO KHÁCH HÀNG ---
router
  .route("/")
  .post(protect, createAppointment) // Đặt lịch mới
  .get(protect, getUserAppointments); // Lấy danh sách lịch

// --- ROUTE DÀNH CHO ADMIN ---
router.get("/admin/all", protect, staff, getAllAppointments); // Đổi thành staff
router.put("/:id/status", protect, staff, updateAppointmentStatus);
router.put("/:id/cancel", protect, cancelAppointmentByCustomer);

export default router;
