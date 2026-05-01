import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  // Kiểm tra xem header có chứa token không
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ chuỗi "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Giải mã token để lấy ID người dùng
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Tìm người dùng trong DB và gán vào req.user (không lấy password)
      req.user = await User.findById(decoded.id).select("-password");
      next(); // Cho phép đi tiếp vào Controller
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // Nếu là admin thì cho đi tiếp
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};

export const staff = (req, res, next) => {
  // Cho phép CẢ Admin và Vet đi qua
  if (req.user && (req.user.role === "admin" || req.user.role === "vet")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as clinic staff" });
  }
};

export const vet = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "vet")) {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as a Vet or Admin" });
  }
};
