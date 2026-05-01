import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "vet"],
      default: "user",
    },
    plan: {
      type: String,
      default: "Free",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
