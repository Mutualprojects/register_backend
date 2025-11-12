// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import DistrictCoordinator from "../models/DistrictCoordinator.js";

export const verifyToken = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
    // decoded: { id, role }

    let user = null;
    const ctx = { id: decoded.id, role: decoded.role };

    if (decoded.role === "admin") {
      user = await Admin.findById(decoded.id).select("_id name email role");
      if (!user) return res.status(401).json({ message: "Invalid token (admin not found)" });
      // admins can see all districts (optional: set assignedDistricts = all)
      ctx.assignedDistricts = []; // your admin controller doesn’t use this
    } else if (decoded.role === "district") {
      user = await DistrictCoordinator.findById(decoded.id).select("_id fullname email district role");
      if (!user) return res.status(401).json({ message: "Invalid token (district not found)" });
      // Coordinator has authority over exactly their district
      ctx.assignedDistricts = [user.district];
    } else {
      return res.status(401).json({ message: "Invalid role" });
    }

    req.user = ctx;
    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};
