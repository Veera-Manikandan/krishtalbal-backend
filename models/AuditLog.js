import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: {
    type: String,
    enum: ["LOGIN", "PURCHASE", "TRANSFER", "ASSIGNMENT", "EXPENDITURE"],
    required: true
  },
  details: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model("AuditLog", schema);