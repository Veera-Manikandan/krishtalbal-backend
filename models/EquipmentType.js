import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  category: {
    type: String,
    enum: ["WEAPON", "VEHICLE", "AMMUNITION"],
    required: true
  }
}, { timestamps: true });

export default mongoose.model("EquipmentType", schema);