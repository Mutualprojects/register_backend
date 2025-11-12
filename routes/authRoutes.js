import express from "express";
import { loginCommon, registerAdmin } from "../controllers/authController.js";

const router = express.Router();

// 🧩 Common login for Admin + Coordinator
router.post("/login", loginCommon);

// 🏢 One-time Admin registration (for setup via Postman)
router.post("/register-admin", registerAdmin);

export default router;
