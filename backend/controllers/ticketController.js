import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

// 1. TẠO TICKET MỚI (User)
export const createTicket = async (req, res) => {
  try {
    const { petId, title, message } = req.body;
    const user = await User.findById(req.user._id);
    const plan = user.plan || "Free";

    // 👉 LUẬT 1: Gói Free KHÔNG được tạo ticket
    if (plan === "Free") {
      return res.status(403).json({
        message: "This feature requires a Premium or Professional plan.",
      });
    }

    // 👉 LUẬT 2: Gói Premium CHỈ ĐƯỢC 1 ticket / tháng
    if (plan === "Premium") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const ticketCount = await Ticket.countDocuments({
        user: req.user._id,
        createdAt: { $gte: startOfMonth },
      });

      if (ticketCount >= 1) {
        return res.status(403).json({
          message:
            "Premium plan limit reached (1 ticket/month). Upgrade to Professional for unlimited access.",
        });
      }
    }

    // 👉 LUẬT 3: Gói Pro thả ga. Tạo ticket lưu vào DB!
    const ticket = await Ticket.create({
      user: req.user._id,
      pet: petId,
      title,
      message,
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. LẤY DANH SÁCH TICKET (Dùng chung cho cả Vet và User)
export const getTickets = async (req, res) => {
  try {
    const isStaff = req.user.role === "admin" || req.user.role === "vet";

    // Nếu là Vet -> Lấy toàn bộ ticket. Nếu là User -> Chỉ lấy ticket của mình.
    const query = isStaff ? {} : { user: req.user._id };

    const tickets = await Ticket.find(query)
      .populate("pet", "name img") // Lấy tên, ảnh thú cưng
      .populate("user", "name plan") // Lấy tên, gói của khách
      .populate("repliedBy", "name") // Lấy tên bác sĩ trả lời
      .sort({ createdAt: -1 }); // Mới nhất lên đầu

    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. VET TRẢ LỜI TICKET (Admin/Vet)
export const replyTicket = async (req, res) => {
  try {
    const { reply } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.reply = reply;
    ticket.status = "Answered";
    ticket.repliedBy = req.user._id;

    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
