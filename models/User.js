import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ["ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"],
    required: true
  },
  baseId: { type: mongoose.Schema.Types.ObjectId, ref: "Base", default: null }
}, { timestamps: true });

export default mongoose.model("User", userSchema);