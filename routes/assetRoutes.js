import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { dashboard, options, auditLogs } from "../controllers/assetController.js";

const router = Router();
router.use(authenticateToken);
router.get("/dashboard", dashboard);
router.get("/options", options);
router.get("/audit-logs", auditLogs);
export default router;