import OwnerNote from "../models/OwnerNote.js";
import Pet from "../models/Pet.js";

// CUSTOMER: Thêm ghi chú mới
export const addOwnerNote = async (req, res) => {
  try {
    const { pet_id, content } = req.body;

    // Kiểm tra quyền: Phải là chủ của con Pet mới được viết note
    const pet = await Pet.findById(pet_id);
    if (!pet || pet.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add notes to this pet" });
    }

    const note = await OwnerNote.create({
      pet: pet_id,
      user: req.user._id,
      content,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// CHUNG: Lấy toàn bộ ghi chú của 1 bé Pet
export const getOwnerNotes = async (req, res) => {
  try {
    // Sắp xếp mới nhất lên đầu
    const notes = await OwnerNote.find({ pet: req.params.petId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
