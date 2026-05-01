import express from "express";
import multer from "multer";
import {
  getPets,
  addPet,
  deletePet,
  getAllPetsAdmin,
  verifyPet,
  rejectPet,
  addMedicalRecord,
} from "../controllers/petController.js";
import { protect, staff } from "../middleware/authMiddleware.js";
import { checkMaxPetsLimit } from "../middleware/planMiddleware.js";

const router = express.Router();

// Cấu hình nơi lưu trữ ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// ==========================================
// ROUTES CHO KHÁCH HÀNG (CUSTOMER)
// ==========================================
router
  .route("/")
  .get(protect, getPets)
  // THỨ TỰ CHUẨN: Xác thực -> Kiểm tra Giới hạn Gói -> Upload Ảnh -> Lưu Database
  .post(protect, checkMaxPetsLimit, upload.single("image"), addPet);

router.delete("/:id", protect, deletePet);

// ==========================================
// ROUTES CHO NHÂN VIÊN PHÒNG KHÁM (VET/ADMIN)
// ==========================================
router.get("/admin/all", protect, staff, getAllPetsAdmin);
router.put("/:id/verify", protect, staff, verifyPet);
router.put("/:id/reject", protect, staff, rejectPet);
router.post("/:id/records", protect, addMedicalRecord);

export default router;
