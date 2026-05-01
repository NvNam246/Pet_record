import mongoose from "mongoose";

const ticketSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },

    title: { type: String, required: true },
    message: { type: String, required: true }, // Nội dung khách hỏi

    status: { type: String, enum: ["Pending", "Answered"], default: "Pending" },

    reply: { type: String }, // Câu trả lời của Bác sĩ
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Lưu ID bác sĩ trả lời
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);
