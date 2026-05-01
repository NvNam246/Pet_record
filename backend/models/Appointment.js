import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    date: {
      type: String, // Lưu dạng YYYY-MM-DD để dễ query
      required: true,
    },
    time: {
      type: String, // Lưu dạng "09:00 AM"
      required: true,
    },
    reason: {
      type: String,
      required: true, // Lý do khám (vd: Khám tổng quát, Tiêm phòng, Cấp cứu...)
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending", // Mặc định khi khách đặt là chờ duyệt
    },
    notes: {
      type: String, // Lời nhắn thêm của khách
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Lưu ID của bác sĩ được phân công
    },
    cancelReason: {
      type: String, // Lưu lý do hủy để báo cho khách
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
