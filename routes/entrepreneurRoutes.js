import express from "express";
import { registerEntrepreneur } from "../controllers/entrepreneurController.js";

const router = express.Router();
router.post("/register", registerEntrepreneur);

export default router;
