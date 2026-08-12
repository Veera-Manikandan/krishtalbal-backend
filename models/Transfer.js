import mongoose from "mongoose";

const schema = new mongoose.Schema({
  sourceBaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base", required: true },
  destinationBaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base", required: true },
  equipmentTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "EquipmentType", required: true },
  quantity: { type: Number, required: true, min: 1 },
  status: {
    type: String,
    enum: ["PENDING", "IN_TRANSIT", "COMPLETED"],
    default: "COMPLETED"
  },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Transfer", schema);