import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Base", schema);