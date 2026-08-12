import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";
import { writeAudit } from "../middleware/audit.js";

export async function createAssignment(req, res, next) {
  try {
    const { baseId, equipmentTypeId, personnel, quantity } = req.body;
    const targetBase = req.user.role === "BASE_COMMANDER" ? req.user.baseId : baseId;
    const qty = Number(quantity);

    if (!targetBase || !equipmentTypeId || !personnel || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "All assignment fields are required" });
    }

    const item = await Assignment.create({
      baseId: targetBase,
      equipmentTypeId,
      personnel,
      quantity: qty,
      createdBy: req.user._id
    });

    await writeAudit(req.user._id, "ASSIGNMENT",
      `Assigned ${qty} equipment item(s) to ${personnel}`,
      { assignmentId: item._id.toString() });

    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function createExpenditure(req, res, next) {
  try {
    const { baseId, equipmentTypeId, quantity, reason } = req.body;
    const targetBase = req.user.role === "BASE_COMMANDER" ? req.user.baseId : baseId;
    const qty = Number(quantity);

    if (!targetBase || !equipmentTypeId || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Valid base, equipment and quantity are required" });
    }

    const item = await Expenditure.create({
      baseId: targetBase,
      equipmentTypeId,
      quantity: qty,
      reason: reason || "",
      createdBy: req.user._id
    });

    await writeAudit(req.user._id, "EXPENDITURE",
      `Expended ${qty} equipment item(s)${reason ? `: ${reason}` : ""}`,
      { expenditureId: item._id.toString() });

    res.status(201).json(item);
  } catch (e) { next(e); }
}

export async function listOperations(req, res, next) {
  try {
    const filter = req.user.role === "BASE_COMMANDER"
      ? { baseId: req.user.baseId }
      : {};

    const [assignments, expenditures] = await Promise.all([
      Assignment.find(filter)
        .populate("baseId", "name")
        .populate("equipmentTypeId", "name category")
        .populate("createdBy", "username")
        .sort({ assignedAt: -1 }),
      Expenditure.find(filter)
        .populate("baseId", "name")
        .populate("equipmentTypeId", "name category")
        .populate("createdBy", "username")
        .sort({ expendedAt: -1 })
    ]);

    res.json({ assignments, expenditures });
  } catch (e) { next(e); }
}