import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ownerNoteRoutes from "./routes/ownerNoteRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

dotenv.config();

// 1. KHỞI TẠO APP TRƯỚC TIÊN
const app = express();

// 2. KHAI BÁO BIẾN __dirname (Bắt buộc khi dùng cú pháp 'import' của ES Module)
const __dirname = path.resolve();

// 3. MIDDLEWARE CƠ BẢN
app.use(cors());
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên

// 4. CẤU HÌNH THƯ MỤC TĨNH (Sau khi app đã khởi tạo)
// Cho phép Frontend truy cập trực tiếp vào các file ảnh trong thư mục /uploads
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// 5. CÁC ĐƯỜNG DẪN API (Routes)
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/records", medicalRecordRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ownernotes", ownerNoteRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/reviews", reviewRoutes);

// 6. CẤU HÌNH CỔNG VÀ CHẠY SERVER
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ Error connecting to MongoDB:", error.message);
  });
