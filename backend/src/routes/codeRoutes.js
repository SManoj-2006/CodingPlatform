import express from "express";
import { executeCode } from "../controllers/codeController.js";
import { protectRoute } from "../middleware/ProtectRoute.js";

const router = express.Router();

router.post("/execute", protectRoute, executeCode);

export default router;
