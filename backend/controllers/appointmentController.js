import Appointment from "../models/Appointment.js";

// 1. KHÁCH HÀNG: Đặt lịch khám mới
export const createAppointment = async (req, res) => {
  try {
    const { pet, date, time, reason, notes } = req.body;

    const appointment = await Appointment.create({
      user: req.user._id,
      pet,
      date,
      time,
      reason,
      notes,
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. KHÁCH HÀNG: Xem danh sách lịch hẹn của chính mình
export const getUserAppointments = async (req, res) => {
  try {
    // Tìm lịch của user này, và lấy luôn thông tin tên, ảnh của Pet đi kèm
    const appointments = await Appointment.find({ user: req.user._id })
      .populate("pet", "name img breed")
      .sort({ date: 1, time: 1 }); // Sắp xếp tăng dần để lịch gần nhất hiện lên đầu

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. ADMIN: Xem toàn bộ lịch hẹn của phòng khám
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({})
      .populate("user", "name email")
      .populate("pet", "name img breed status")
      .sort({ date: 1, time: 1 });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. ADMIN: Cập nhật trạng thái lịch hẹn (Duyệt / Hủy / Hoàn thành)
// ADMIN/VET: Cập nhật Lịch hẹn (Trạng thái, Giờ, Bác sĩ, Hủy)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, vet, date, time, cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Cập nhật các trường nếu có gửi lên
    if (status) appointment.status = status;
    if (vet) appointment.vet = vet;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (cancelReason) appointment.cancelReason = cancelReason;

    const updatedAppointment = await appointment.save();

    // Populate lại dữ liệu trước khi trả về để Frontend cập nhật ngay lập tức
    await updatedAppointment.populate("user", "name email phone");
    await updatedAppointment.populate("pet", "name img breed weight age");
    await updatedAppointment.populate("vet", "name");

    res.status(200).json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// CUSTOMER: Tự hủy lịch hẹn (Yêu cầu trước 2 tiếng)
export const cancelAppointmentByCustomer = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Kiểm tra quyền: Chỉ chủ của lịch hẹn mới được hủy
    if (appointment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this appointment" });
    }

    // Kiểm tra thời gian: Phải trước 2 tiếng
    // Ghép ngày và giờ của lịch hẹn thành 1 object Date
    const appointmentDateTime = new Date(
      `${appointment.date}T${appointment.time}`,
    );
    const now = new Date();

    // Tính khoảng cách thời gian (bằng milliseconds)
    const diffInMs = appointmentDateTime - now;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 2) {
      return res.status(400).json({
        message:
          "You can only cancel appointments at least 2 hours in advance. Please call the clinic directly.",
      });
    }

    // Cập nhật trạng thái và lý do
    appointment.status = "cancelled";
    appointment.cancelReason = "Cancelled by Customer via App";
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
