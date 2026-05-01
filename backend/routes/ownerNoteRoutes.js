import express from "express";
import {
  addOwnerNote,
  getOwnerNotes,
} from "../controllers/ownerNoteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addOwnerNote);
router.get("/pet/:petId", protect, getOwnerNotes); // Admin, Vet, Customer đều đọc được

export default router;
