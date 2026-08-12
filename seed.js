import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import Base from "./models/Base.js";
import EquipmentType from "./models/EquipmentType.js";
import User from "./models/User.js";
import Purchase from "./models/Purchase.js";
import Transfer from "./models/Transfer.js";
import Assignment from "./models/Assignment.js";
import Expenditure from "./models/Expenditure.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();
await connectDB();

await Promise.all([
  User.deleteMany({}),
  Base.deleteMany({}),
  EquipmentType.deleteMany({}),
  Purchase.deleteMany({}),
  Transfer.deleteMany({}),
  Assignment.deleteMany({}),
  Expenditure.deleteMany({}),
  AuditLog.deleteMany({})
]);

const bases = await Base.insertMany([
  { name: "Alpha Base", location: "North Sector" },
  { name: "Bravo Base", location: "East Sector" },
  { name: "Charlie Base", location: "South Sector" }
]);

const equipment = await EquipmentType.insertMany([
  { name: "M4 Carbine", category: "WEAPON" },
  { name: "Humvee", category: "VEHICLE" },
  { name: "5.56mm Ammunition", category: "AMMUNITION" },
  { name: "9mm Ammunition", category: "AMMUNITION" }
]);

const passwordHash = await bcrypt.hash("Password@123", 12);

await User.create([
  { username: "admin", passwordHash, role: "ADMIN" },
  { username: "commander", passwordHash, role: "BASE_COMMANDER", baseId: bases[0]._id },
  { username: "logistics", passwordHash, role: "LOGISTICS_OFFICER" }
]);

const admin = await User.findOne({ username: "admin" });

await Purchase.create([
  { baseId: bases[0]._id, equipmentTypeId: equipment[0]._id, quantity: 100, createdBy: admin._id },
  { baseId: bases[0]._id, equipmentTypeId: equipment[2]._id, quantity: 1000, createdBy: admin._id },
  { baseId: bases[1]._id, equipmentTypeId: equipment[1]._id, quantity: 20, createdBy: admin._id }
]);

console.log("Seed completed.");
console.log("admin / Password@123");
console.log("commander / Password@123");
console.log("logistics / Password@123");
process.exit(0);