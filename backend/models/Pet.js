import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    // Liên kết thú cưng với tài khoản người dùng
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: String, required: true },
    weight: { type: String, required: true },
    img: {
      type: String,
      // Nếu không upload ảnh, sẽ lấy ảnh mặc định này
      default:
        "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rejectReason: {
      type: String,
      default: "", // Lưu lý do bị từ chối
    },

    plan: {
      type: String,
      enum: ["Free", "Premium", "Professional", "Enterprise"],
      default: "Free",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Pet", petSchema);
