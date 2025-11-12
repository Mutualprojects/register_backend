import Admin from "../models/Admin.js";
import DistrictCoordinator from "../models/DistrictCoordinator.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ==========================================================
   🧑‍💼 Common Login (Admin + District Coordinator)
========================================================== */
export const loginCommon = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 🔹 Try Admin first
    let user = await Admin.findOne({ email }).select("+password");
    let role = "admin";

    // 🔹 If not found, try District Coordinator
    if (!user) {
      user = await DistrictCoordinator.findOne({ email }).select("+password");
      role = "district";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "Account password not set. Please contact admin." });
    }

    // 🔒 Compare password (bcrypt handles hash comparison)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET missing in environment variables!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // 🔑 Generate JWT Token
    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // ⏰ Include password change timestamp if available
    const lastPasswordChange = user.passwordChangedAt
      ? new Date(user.passwordChangedAt).toLocaleString()
      : "Not available";

    res.status(200).json({
      message: "✅ Login successful",
      token,
      role,
      user: {
        id: user._id,
        name: user.name || user.fullname,
        email: user.email,
        district: user.district || null,
        lastPasswordChange,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ==========================================================
   🏢 Register Admin (One-time setup via Postman)
========================================================== */
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // ✅ Hash password once
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    res.status(201).json({
      message: "✅ Admin registered successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("❌ Admin registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
