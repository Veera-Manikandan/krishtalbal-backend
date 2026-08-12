import mongoose from "mongoose";

const schema = new mongoose.Schema({
  baseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base", required: true },
  equipmentTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType", required: true },
  personnel: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  assignedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Assignment", schema);