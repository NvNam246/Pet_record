import Pet from "../models/Pet.js";

// 1. Lấy danh sách thú cưng của khách hàng (GET /api/pets)
export const getPets = async (req, res) => {
  try {
    const pets = await Pet.find({ user: req.user._id });
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Thêm thú cưng mới (POST /api/pets)
export const addPet = async (req, res) => {
  try {
    const { name, breed, age, weight, plan } = req.body;

    const defaultImg =
      "https://media.istockphoto.com/photos/pet-group-picture-id474430136?k=6&m=474430136&s=612x612&w=0&h=tULT2T8NKvt5kVhMknBkj4ndtWXPVTpw3li766UmjAU=";
    const imgPath = req.file
      ? `http://localhost:5000/uploads/${req.file.filename}`
      : defaultImg;

    const pet = await Pet.create({
      user: req.user._id,
      name,
      breed,
      age,
      weight,
      plan: plan || "Free",
      img: imgPath,
    });

    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Admin/Vet lấy danh sách TẤT CẢ thú cưng (GET /api/pets/admin/all)
export const getAllPetsAdmin = async (req, res) => {
  try {
    const pets = await Pet.find({}).populate("user", "name email plan");
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. Admin/Vet duyệt hồ sơ (PUT /api/pets/:id/verify)
export const verifyPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // RÀNG BUỘC SRS: Vet/Admin không được tự duyệt Pet của chính mình
    if (pet.user.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: "Conflict of Interest: You cannot verify your own pet.",
      });
    }

    pet.status = "verified";
    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 5. Admin/Vet từ chối hồ sơ (PUT /api/pets/:id/reject)
export const rejectPet = async (req, res) => {
  try {
    const { reason } = req.body;
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // RÀNG BUỘC SRS: Vet/Admin không được tự từ chối Pet của chính mình
    if (pet.user.toString() === req.user._id.toString()) {
      return res.status(403).json({
        message: "Conflict of Interest: You cannot reject your own pet.",
      });
    }

    pet.status = "rejected";
    pet.rejectReason =
      reason || "Invalid file. Please check the information or image again.";
    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 6. Xóa thú cưng (DELETE /api/pets/:id) - ĐÃ GỘP 2 HÀM LÀM 1
export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const isOwner = pet.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    // BƯỚC 1: Kiểm tra quyền. Chỉ Chủ nuôi hoặc Admin mới được thao tác Xóa
    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this pet" });
    }

    // BƯỚC 2: Nếu là Chủ nuôi, CHẶN xóa nếu hồ sơ đã được Verified
    if (isOwner && !isAdmin && pet.status === "verified") {
      return res.status(403).json({
        message:
          "The medical records have been verified. Please contact the clinic to request deletion.",
      });
    }

    // Nếu qua được các chốt chặn trên -> Xóa thành công
    await pet.deleteOne();
    res.status(200).json({ message: "Pet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Thêm hồ sơ bệnh án mới (Chỉ dành cho Vet/Admin)
export const addMedicalRecord = async (req, res) => {
  try {
    const { type, diagnosis, treatment, date } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ message: "Pet not found" });

    const newRecord = {
      date: date || new Date(),
      type, // Ví dụ: "Vaccine", "Checkup", "Surgery"
      diagnosis,
      treatment,
      vet: {
        _id: req.user._id,
        name: req.user.name, // Lưu tên bác sĩ khám
      },
    };

    // Đẩy record mới vào mảng records của thú cưng
    pet.records.push(newRecord);
    await pet.save();

    res.status(200).json(pet);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add record", error: error.message });
  }
};

export const getPetById = async (req, res) => {
  try {
    // SỬA: populate đúng trường 'user' như trong Schema
    const pet = await Pet.findById(req.params.id).populate("user", "name plan");

    if (!pet) return res.status(404).json({ message: "Pet not found" });

    // SỬA: Kiểm tra dựa trên pet.user._id (Không phải owner)
    if (
      req.user.role === "user" &&
      pet.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
