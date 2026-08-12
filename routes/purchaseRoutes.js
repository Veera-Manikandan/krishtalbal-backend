import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { createPurchase, listPurchases } from "../controllers/purchaseController.js";

const router = Router();
router.use(authenticateToken);
router.get("/", listPurchases);
router.post("/", authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"), createPurchase);
export default router;