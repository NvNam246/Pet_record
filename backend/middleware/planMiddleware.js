import User from "../models/User.js";
import { PLAN_LIMITS, PLANS } from "../config/plansConfig.js";

// Middleware kiểm tra quyền theo loại tính năng (feature)
// Ví dụ sử dụng ở Route: router.get('/export', protect, planGate('canExport'), exportData);
export const planGate = (requiredFeature) => {
  return async (req, res, next) => {
    try {
      // 1. Nếu là Admin hoặc Vet, cho qua luôn (Họ không bị giới hạn bởi Gói của Khách)
      if (req.user.role === "admin" || req.user.role === "vet") {
        return next();
      }

      // 2. Lấy thông tin user hiện tại (Để biết họ đang dùng gói nào)
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Mặc định, nếu user chưa có thuộc tính plan, gán gói FREE
      const currentPlanName = user.plan || PLANS.FREE;
      const userPlanLimits = PLAN_LIMITS[currentPlanName];

      // 3. Kiểm tra tính năng
      if (!userPlanLimits || userPlanLimits[requiredFeature] !== true) {
        // Cấu trúc lỗi chuẩn JSON như bạn đã yêu cầu trong SRS
        return res.status(403).json({
          error: "PLAN_LIMIT_EXCEEDED",
          message: `Your current plan (${currentPlanName}) does not support this feature.`,
          currentPlan: currentPlanName,
          requiredFeature: requiredFeature,
          upgradeUrl: "/pricing",
        });
      }

      // Nếu pass, cho phép đi tiếp
      next();
    } catch (error) {
      res
        .status(500)
        .json({ message: "Server error in Plan Gate", error: error.message });
    }
  };
};

// Middleware kiểm tra số lượng Pet (Giới hạn quan trọng nhất)
export const checkMaxPetsLimit = async (req, res, next) => {
  try {
    if (req.user.role === "admin" || req.user.role === "vet") return next();

    const user = await User.findById(req.user._id);
    const currentPlanName = user.plan || PLANS.FREE;
    const maxPetsAllowed = PLAN_LIMITS[currentPlanName].maxPets;

    // Đếm số Pet hiện tại của User (Cần import model Pet ở đầu file)
    const { default: Pet } = await import("../models/Pet.js");
    const currentPetCount = await Pet.countDocuments({ user: req.user._id });

    if (currentPetCount >= maxPetsAllowed) {
      return res.status(403).json({
        error: "PLAN_LIMIT_EXCEEDED",
        message: `Your ${currentPlanName} plan only allows up to ${maxPetsAllowed} pet(s).`,
        currentPlan: currentPlanName,
        upgradeUrl: "/pricing",
      });
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error checking pet limit",
        error: error.message,
      });
  }
};
