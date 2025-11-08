import express from "express";
import {
  getEntrepreneurs,
  approveEntrepreneur,
  bulkApprove
} from "../controllers/adminController.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/entrepreneurs", verifyAdmin, getEntrepreneurs);
router.put("/approve/:id", verifyAdmin, approveEntrepreneur);
router.put("/bulk-approve", verifyAdmin, bulkApprove);

export default router;
