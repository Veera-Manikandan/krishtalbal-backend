import Purchase from "../models/Purchase.js";
import Transfer from "../models/Transfer.js";
import Assignment from "../models/Assignment.js";
import Expenditure from "../models/Expenditure.js";
import Base from "../models/Base.js";
import EquipmentType from "../models/EquipmentType.js";
import AuditLog from "../models/AuditLog.js";

function dateFilter(startDate, endDate) {
  const filter = {};
  if (startDate || endDate) {
    filter.$gte = startDate ? new Date(startDate) : new Date("1970-01-01");
    filter.$lte = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date();
  }
  return filter;
}

export async function options(req, res, next) {
  try {
    const [bases, equipmentTypes] = await Promise.all([
      Base.find().sort({ name: 1 }),
      EquipmentType.find().sort({ category: 1, name: 1 })
    ]);
    res.json({ bases, equipmentTypes });
  } catch (e) { next(e); }
}

export async function dashboard(req, res, next) {
  try {
    const { baseId, equipmentTypeId, startDate, endDate } = req.query;
    const scopeBase = req.user.role === "BASE_COMMANDER" ? req.user.baseId?.toString() : baseId;
    const baseObject = scopeBase || null;
    const equipmentObject = equipmentTypeId || null;
    const date = dateFilter(startDate, endDate);

    const purchaseMatch = {
      ...(baseObject ? { baseId: baseObject } : {}),
      ...(equipmentObject ? { equipmentTypeId: equipmentObject } : {}),
      ...(Object.keys(date).length ? { purchasedAt: date } : {})
    };
    const transferInMatch = {
      ...(baseObject ? { destinationBaseId: baseObject } : {}),
      ...(equipmentObject ? { equipmentTypeId: equipmentObject } : {}),
      ...(Object.keys(date).length ? { createdAt: date } : {})
    };
    const transferOutMatch = {
      ...(baseObject ? { sourceBaseId: baseObject } : {}),
      ...(equipmentObject ? { equipmentTypeId: equipmentObject } : {}),
      ...(Object.keys(date).length ? { createdAt: date } : {})
    };
    const assignmentMatch = {
      ...(baseObject ? { baseId: baseObject } : {}),
      ...(equipmentObject ? { equipmentTypeId: equipmentObject } : {}),
      ...(Object.keys(date).length ? { assignedAt: date } : {})
    };
    const expenditureMatch = {
      ...(baseObject ? { baseId: baseObject } : {}),
      ...(equipmentObject ? { equipmentTypeId: equipmentObject } : {}),
      ...(Object.keys(date).length ? { expendedAt: date } : {})
    };

    const sum = async (Model, match) => {
      const rows = await Model.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$quantity" } } }
      ]);
      return rows[0]?.total || 0;
    };

    const [purchases, transfersIn, transfersOut, assigned, expended] =
      await Promise.all([
        sum(Purchase, purchaseMatch),
        sum(Transfer, { ...transferInMatch, status: "COMPLETED" }),
        sum(Transfer, { ...transferOutMatch, status: "COMPLETED" }),
        sum(Assignment, assignmentMatch),
        sum(Expenditure, expenditureMatch)
      ]);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = netMovement - assigned - expended;

    res.json({
      openingBalance: 0,
      purchases,
      transfersIn,
      transfersOut,
      netMovement,
      assigned,
      expended,
      closingBalance
    });
  } catch (e) { next(e); }
}

export async function auditLogs(req, res, next) {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "username role")
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(logs);
  } catch (e) { next(e); }
}