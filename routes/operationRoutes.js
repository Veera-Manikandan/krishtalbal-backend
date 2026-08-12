import { Router } from "express";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware.js";
import { createAssignment, createExpenditure, listOperations } from "../controllers/operationController.js";

const router = Router();
router.use(authenticateToken);
router.get("/", listOperations);
router.post("/assignments", authorizeRoles("ADMIN", "BASE_COMMANDER"), createAssignment);
router.post("/expenditures", authorizeRoles("ADMIN", "BASE_COMMANDER"), createExpenditure);
export default router;