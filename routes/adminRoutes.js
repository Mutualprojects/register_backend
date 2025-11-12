import express from "express";
import {
  createDistrictCoordinator,
  getEntrepreneurs,
  approveEntrepreneur,
  rejectEntrepreneur,
   getAllCoordinators,
  updateCoordinator,
  deleteCoordinator,
  markPending,
  bulkApprove,
  bulkReject,
  bulkDelete,
  deleteEntrepreneur,
  getDistrictStats,
} from "../controllers/adminController.js";

const router = express.Router();

/* ==========================================================
   🧑‍💼 Admin: District Coordinator Management
========================================================== */
// 👉 Create a single District Coordinator (Admin only)
router.post("/create-coordinator", createDistrictCoordinator);
router.get("/cordinator", getAllCoordinators);              // List / Filter Coordinators
router.put("/district-coordinator/:id", updateCoordinator);            // Update Coordinator
router.delete("/district-coordinators/:id", deleteCoordinator); 

/* ==========================================================
   👩‍🔧 Entrepreneur Management
========================================================== */
// Fetch all or filtered entrepreneurs
router.get("/entrepreneurs", getEntrepreneurs);

// Approve / Reject / Pending
router.put("/approve/:id", approveEntrepreneur);
router.put("/reject/:id", rejectEntrepreneur);
router.put("/pending/:id", markPending);

// Delete Single Entrepreneur
router.delete("/delete/:id", deleteEntrepreneur);

/* ==========================================================
   ⚙️ Bulk Operations
========================================================== */
router.post("/bulk-approve", bulkApprove);
router.post("/bulk-reject", bulkReject);
router.post("/bulk-delete", bulkDelete);

/* ==========================================================
   📊 District Stats
========================================================== */
router.get("/district-stats", getDistrictStats);

export default router;
