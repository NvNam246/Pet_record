import MedicalRecord from "../models/MedicalRecord.js";

// Thêm bệnh án mới (Admin/Vet only)
export const addMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.create({
      ...req.body,
      vet: req.user._id, // Lấy ID bác sĩ từ token
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Lấy lịch sử bệnh án của một bé Pet cụ thể
export const getPetHistory = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ pet: req.params.petId })
      .populate("vet", "name")
      .sort({ date: -1 }); // Mới nhất hiện lên đầu
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Xóa bệnh án (Chỉ Admin)
export const deleteMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    await record.deleteOne();
    res.status(200).json({ message: "Record removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Cập nhật bệnh án (Chỉ Admin)
export const updateMedicalRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });

    // Cập nhật các trường dữ liệu hiện có
    record.type = req.body.type || record.type;
    record.diagnosis = req.body.diagnosis || record.diagnosis;
    record.treatment = req.body.treatment || record.treatment;
    record.notes = req.body.notes || record.notes;

    // 👉 THÊM DÒNG NÀY ĐỂ CẬP NHẬT GHI CHÚ NỘI BỘ (Nếu có gửi lên thì cập nhật, không thì giữ nguyên)
    if (req.body.internalNotes !== undefined) {
      record.internalNotes = req.body.internalNotes;
    }

    const updatedRecord = await record.save();
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
