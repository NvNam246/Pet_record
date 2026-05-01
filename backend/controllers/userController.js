import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ADMIN: Lấy danh sách tất cả tài khoản
export const getAllUsers = async (req, res) => {
  try {
    // Không trả về mật khẩu
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ADMIN: Cập nhật Role cho user
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // Gửi lên 'user' hoặc 'vet'
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Không cho phép tự đổi quyền của chính mình (chống lỗi tự kick bản thân)
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot change your own role." });
    }

    user.role = role;
    const updatedUser = await user.save();

    // Ẩn mật khẩu trước khi trả về
    updatedUser.password = undefined;
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // 👉 2. XỬ LÝ MÃ HÓA MẬT KHẨU TRƯỚC KHI LƯU
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10); // Tạo chuỗi bảo vệ
        user.password = await bcrypt.hash(req.body.password, salt); // Mã hóa mật khẩu mới
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ADMIN: Xóa tài khoản người dùng
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // RÀNG BUỘC: Không cho phép Admin tự xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account." });
    }

    // Xóa tài khoản
    await user.deleteOne();
    res.status(200).json({ message: "User deleted successfully" });

    /* LƯU Ý KIẾN TRÚC: Trong thực tế, khi xóa User, 
       chúng ta sẽ cần xóa thêm Pet, Appointments và Medical Records của người đó (Cascading Delete). 
       Tạm thời chúng ta xóa User trước để hoàn thiện luồng UI. */
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
