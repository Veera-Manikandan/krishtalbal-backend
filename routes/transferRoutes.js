import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { createTransfer, listTransfers } from "../controllers/transferController.js";

const router = Router();
router.use(authenticateToken);
router.get("/", listTransfers);
router.post("/", authorizeRoles("ADMIN", "BASE_COMMANDER", "LOGISTICS_OFFICER"), createTransfer);
export default router;