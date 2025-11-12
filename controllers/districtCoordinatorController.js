import Entrepreneur from "../models/Entrepreneur.js";
import { sendMail } from "../utils/sendMail.js";

const COMPANY_NAME = "BRIHASPATHI TECHNOLOGIES PRIVATE LIMITED";
const WHATSAPP_LINK = "https://chat.whatsapp.com/DOHjxHWQBjfEHmi8N8iAT4";

/* ==========================================================
   1️⃣ Get Entrepreneurs — Filtered by Assigned Districts
========================================================== */
export const getEntrepreneursByDistrict = async (req, res) => {
  try {
    const { status, search } = req.query;
    const allowedDistricts = req.user?.assignedDistricts || [];

    if (!allowedDistricts.length)
      return res.status(403).json({ message: "No district authority assigned" });

    const filter = { formDistrict: { $in: allowedDistricts } };
    if (status) filter.status = status;
    if (search)
      filter.$or = [
        { fullname: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
      ];

    const list = await Entrepreneur.find(filter).sort({ createdAt: -1 });
    const data = list.map((e) => ({
      ...e._doc,
      state: e.formState,
      district: e.formDistrict,
    }));

    res.json({ count: data.length, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   2️⃣ Approve Entrepreneur — Restricted by District
========================================================== */
export const approveEntrepreneurDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Entrepreneur.findById(id);
    if (!user) return res.status(404).json({ message: "Entrepreneur not found" });

    // Check authorization
    if (!req.user.assignedDistricts.includes(user.formDistrict))
      return res.status(403).json({ message: "Unauthorized for this district" });

    user.status = "Accepted";
    await user.save();

    await sendMail(
      user.email,
      "✅ Registration Approved",
      `<div style="font-family:Arial;background:#fff;padding:20px;">
        <h2 style="color:#07518a;">Congratulations ${user.fullname}! 🎉</h2>
        <p>Your registration as a <b>Solar Entrepreneur</b> has been approved.</p>
        <p>Region: ${user.formDistrict}, ${user.formState}</p>
        <p>Welcome to ${COMPANY_NAME}.</p>
        <p><a href="${WHATSAPP_LINK}">Join BTPL WhatsApp Group</a></p>
      </div>`
    );

    res.json({ message: "Entrepreneur approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   3️⃣ Reject Entrepreneur — Restricted by District
========================================================== */
export const rejectEntrepreneurDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await Entrepreneur.findById(id);
    if (!user) return res.status(404).json({ message: "Entrepreneur not found" });

    if (!req.user.assignedDistricts.includes(user.formDistrict))
      return res.status(403).json({ message: "Unauthorized for this district" });

    user.status = "Rejected";
    await user.save();

    await sendMail(
      user.email,
      "❌ Application Not Approved",
      `<div style="font-family:Arial;background:#fff;padding:20px;">
        <p>Dear ${user.fullname},</p>
        <p>Your Solar Entrepreneur application from ${user.formDistrict}, ${user.formState} was not approved.</p>
        <p><b>Reason:</b> ${reason || "Criteria not met this time."}</p>
        <p>Stay connected with ${COMPANY_NAME} for future opportunities.</p>
      </div>`
    );

    res.json({ message: "Entrepreneur rejected successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   4️⃣ Mark Pending — Restricted
========================================================== */
export const markPendingDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Entrepreneur.findById(id);
    if (!user) return res.status(404).json({ message: "Entrepreneur not found" });

    if (!req.user.assignedDistricts.includes(user.formDistrict))
      return res.status(403).json({ message: "Unauthorized for this district" });

    user.status = "Pending";
    await user.save();

    res.json({ message: "Entrepreneur marked as pending", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   5️⃣ Bulk Approve — Restricted by Districts
========================================================== */
export const bulkApproveDistrict = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids))
      return res.status(400).json({ message: "IDs array required" });

    const users = await Entrepreneur.find({ _id: { $in: ids } });
    const allowed = users.filter((u) =>
      req.user.assignedDistricts.includes(u.formDistrict)
    );

    let count = 0;
    for (const user of allowed) {
      user.status = "Accepted";
      await user.save();
      count++;

      await sendMail(
        user.email,
        "✅ Registration Approved",
        `<div style="font-family:Arial;background:#fff;padding:20px;">
          <h2 style="color:#07518a;">Congratulations ${user.fullname}! 🎉</h2>
          <p>Your registration as a <b>Solar Entrepreneur</b> has been approved.</p>
          <p>Region: ${user.formDistrict}, ${user.formState}</p>
          <p>Welcome to ${COMPANY_NAME}.</p>
        </div>`
      );
    }

    res.json({ message: `✅ Approved ${count} entrepreneurs.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   6️⃣ Bulk Reject — Restricted by Districts
========================================================== */
export const bulkRejectDistrict = async (req, res) => {
  try {
    const { ids, reason } = req.body;
    if (!ids || !Array.isArray(ids))
      return res.status(400).json({ message: "IDs array required" });

    const users = await Entrepreneur.find({ _id: { $in: ids } });
    const allowed = users.filter((u) =>
      req.user.assignedDistricts.includes(u.formDistrict)
    );

    let count = 0;
    for (const user of allowed) {
      user.status = "Rejected";
      await user.save();
      count++;

      await sendMail(
        user.email,
        "❌ Application Not Approved",
        `<div style="font-family:Arial;background:#fff;padding:20px;">
          <p>Dear ${user.fullname},</p>
          <p>Your Solar Entrepreneur application from ${user.formDistrict}, ${user.formState} was not approved.</p>
          <p><b>Reason:</b> ${reason || "Criteria not met this time."}</p>
          <p>Stay connected with ${COMPANY_NAME} for future opportunities.</p>
        </div>`
      );
    }

    res.json({ message: `❌ Rejected ${count} entrepreneurs.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   7️⃣ Bulk Delete — Restricted by Districts
========================================================== */
export const bulkDeleteDistrict = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids))
      return res.status(400).json({ message: "IDs array required" });

    const users = await Entrepreneur.find({ _id: { $in: ids } });
    const allowedIds = users
      .filter((u) => req.user.assignedDistricts.includes(u.formDistrict))
      .map((u) => u._id);

    const result = await Entrepreneur.deleteMany({ _id: { $in: allowedIds } });

    res.json({ message: `🗑️ Deleted ${result.deletedCount} entrepreneurs.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ==========================================================
   8️⃣ District Stats (Only for Assigned Districts)
========================================================== */
export const getDistrictStatsByCoordinator = async (req, res) => {
  try {
    const allowedDistricts = req.user?.assignedDistricts || [];

    const stats = await Promise.all(
      allowedDistricts.map(async (dist) => {
        const total = await Entrepreneur.countDocuments({ formDistrict: dist });
        const accepted = await Entrepreneur.countDocuments({
          formDistrict: dist,
          status: "Accepted",
        });
        const rejected = await Entrepreneur.countDocuments({
          formDistrict: dist,
          status: "Rejected",
        });
        const pending = await Entrepreneur.countDocuments({
          formDistrict: dist,
          status: "Pending",
        });
        return { district: dist, total, accepted, rejected, pending };
      })
    );

    res.json({ totalDistricts: stats.length, stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
