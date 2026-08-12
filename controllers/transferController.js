import Transfer from "../models/Transfer.js";
import Base from "../models/Base.js";
import EquipmentType from "../models/EquipmentType.js";
import Purchase from "../models/Purchase.js";
import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";
import { writeAudit } from "../middleware/audit.js";

async function availableStock(baseId, equipmentTypeId) {
  const sum = async (Model, match) => {
    const rows = await Model.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$quantity" } } }
    ]);
    return rows[0]?.total || 0;
  };

  const [purchases, inQty, outQty, assigned, expended] = await Promise.all([
    sum(Purchase, { baseId, equipmentTypeId }),
    sum(Transfer, { destinationBaseId: baseId, equipmentTypeId, status: "COMPLETED" }),
    sum(Transfer, { sourceBaseId: baseId, equipmentTypeId, status: "COMPLETED" }),
    sum(Assignment, { baseId, equipmentTypeId }),
    sum(Expenditure, { baseId, equipmentTypeId })
  ]);

  return purchases + inQty - outQty - assigned - expended;
}

export async function createTransfer(req, res, next) {
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const qty = Number(quantity);

    if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Valid source, destination, equipment and quantity are required" });
    }
    if (sourceBaseId === destinationBaseId) {
      return res.status(400).json({ message: "Source and destination bases must differ" });
    }
    if (req.user.role === "BASE_COMMANDER" &&
        req.user.baseId?.toString() !== sourceBaseId) {
      return res.status(403).json({ message: "Commander can only transfer from assigned base" });
    }

    const [source, destination, equipment] = await Promise.all([
      Base.findById(sourceBaseId),
      Base.findById(destinationBaseId),
      EquipmentType.findById(equipmentTypeId)
    ]);
    if (!source || !destination || !equipment) {
      return res.status(404).json({ message: "Source, destination or equipment not found" });
    }

    const stock = await availableStock(sourceBaseId, equipmentTypeId);
    if (stock < qty) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${stock}` });
    }

    const transfer = await Transfer.create({
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity: qty,
      status: "COMPLETED",
      initiatedBy: req.user._id
    });

    await writeAudit(
      req.user._id,
      "TRANSFER",
      `Transferred ${qty} ${equipment.name} from ${source.name} to ${destination.name}`,
      { transferId: transfer._id.toString() }
    );

    res.status(201).json(await transfer.populate(["sourceBaseId", "destinationBaseId", "equipmentTypeId"]));
  } catch (e) { next(e); }
}

export async function listTransfers(req, res, next) {
  try {
    const filter = req.user.role === "BASE_COMMANDER"
      ? { $or: [{ sourceBaseId: req.user.baseId }, { destinationBaseId: req.user.baseId }] }
      : {};
    const rows = await Transfer.find(filter)
      .populate("sourceBaseId", "name")
      .populate("destinationBaseId", "name")
      .populate("equipmentTypeId", "name category")
      .populate("initiatedBy", "username")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) { next(e); }
}