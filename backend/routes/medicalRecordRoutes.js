import express from "express";
import {
  addMedicalRecord,
  getPetHistory,
  deleteMedicalRecord,
  updateMedicalRecord,
} from "../controllers/medicalRecordController.js";
import { protect, admin, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route 1: Bác sĩ/Admin thêm bệnh án mới (Phải là admin mới được post)
router.get("/pet/:petId", protect, getPetHistory);
router.post("/", protect, staff, addMedicalRecord);
router
  .route("/:id")
  .put(protect, staff, updateMedicalRecord)
  .delete(protect, staff, deleteMedicalRecord);

export default router;
