import mongoose from "mongoose";

const ownerNoteSchema = mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("OwnerNote", ownerNoteSchema);
