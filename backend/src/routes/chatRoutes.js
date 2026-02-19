import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import { protecRoute } from "../middleware/ProtectRoute.js";




const router =  express.Router();

router.get("/token",protecRoute,getStreamToken);

export default router;