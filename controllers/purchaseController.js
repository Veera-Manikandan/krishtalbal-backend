import Purchase from "../models/Purchase.js";
import Base from "../models/Base.js";
import EquipmentType from "../models/EquipmentType.js";
import { writeAudit } from "../middleware/audit.js";

export async function createPurchase(req, res, next) {
  try {
    const { baseId, equipmentTypeId, quantity, purchasedAt } = req.body;
    const targetBase = req.user.role === "BASE_COMMANDER" ? req.user.baseId : baseId;

    if (!targetBase || !equipmentTypeId || !Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ message: "baseId, equipmentTypeId and positive integer quantity are required" });
    }

    const [base, equipment] = await Promise.all([
      Base.findById(targetBase),
      EquipmentType.findById(equipmentTypeId)
    ]);
    if (!base || !equipment) return res.status(404).json({ message: "Base or equipment type not found" });

    const purchase = await Purchase.create({
      baseId: targetBase,
      equipmentTypeId,
      quantity: Number(quantity),
      purchasedAt: purchasedAt || new Date(),
      createdBy: req.user._id
    });

    await writeAudit(
      req.user._id,
      "PURCHASE",
      `Purchased ${quantity} ${equipment.name} for ${base.name}`,
      { purchaseId: purchase._id.toString() }
    );

    res.status(201).json(await purchase.populate(["baseId", "equipmentTypeId"]));
  } catch (e) { next(e); }
}

export async function listPurchases(req, res, next) {
  try {
    const filter = req.user.role === "BASE_COMMANDER"
      ? { baseId: req.user.baseId }
      : {};
    const rows = await Purchase.find(filter)
      .populate("baseId", "name location")
      .populate("equipmentTypeId", "name category")
      .populate("createdBy", "username")
      .sort({ purchasedAt: -1 });
    res.json(rows);
  } catch (e) { next(e); }
}