import User from "../models/User.js";
import { PLANS } from "../config/plansConfig.js";

export const demoUpgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;

    // 1. CHÚ Ý: Bỏ qua kiểm tra phân biệt hoa thường để chống lỗi
    const validPlans = Object.values(PLANS);
    // Chuẩn hóa tên gói gửi lên (Ví dụ: "premium" -> "Premium")
    const formattedPlan = validPlans.find(
      (p) => p.toLowerCase() === plan.toLowerCase(),
    );

    if (!formattedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    // 2. Cập nhật gói cho User vào thẳng Database
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.plan = formattedPlan; // Gán đúng chữ "Premium"
    await user.save(); // LƯU VÀO DATABASE

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
