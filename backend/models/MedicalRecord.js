import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
    },
    vet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Bác sĩ thực hiện
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["Checkup", "Vaccination", "Surgery", "Emergency", "Other"],
      default: "Checkup",
    },
    diagnosis: { type: String, required: true }, // Chẩn đoán
    treatment: { type: String }, // Phương pháp điều trị
    symptoms: { type: String }, // Triệu chứng ban đầu

    // Danh sách thuốc (Prescription)
    medications: [
      {
        name: String,
        dosage: String, // Liều lượng (vd: 2 viên/ngày)
        duration: String, // Thời gian uống (vd: 5 ngày)
      },
    ],

    // Hình ảnh đính kèm (X-Quang, kết quả xét nghiệm)
    attachments: [String],

    notes: { type: String },

    internalNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
