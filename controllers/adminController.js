import Entrepreneur from "../models/Entrepreneur.js";
import { sendMail } from "../utils/sendMail.js";

/* Get all or filtered entrepreneurs */
export const getEntrepreneurs = async (req, res) => {
  try {
    const { district, status } = req.query;
    const filter = {};
    if (district) filter.district = district;
    if (status) filter.status = status;

    const list = await Entrepreneur.find(filter).sort({ createdAt: -1 });
    res.json({ count: list.length, data: list });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Approve single entrepreneur */
export const approveEntrepreneur = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Entrepreneur.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "Accepted";
    await user.save();

    await sendMail(
      user.email,
      "✅ Registration Approved",
      `<p>Dear ${user.fullname},</p>
       <p>Congratulations! Your registration as a <b>Solar Entrepreneur</b> has been approved.</p>
       <p>Welcome to Brihaspathi Technologies Ltd.</p>`
    );

    res.json({ message: "Approved successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* Bulk approve */
export const bulkApprove = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: "IDs required" });

    const users = await Entrepreneur.find({ _id: { $in: ids } });
    for (const user of users) {
      user.status = "Accepted";
      await user.save();

      await sendMail(
        user.email,
        "✅ Registration Approved",
        `<p>Dear ${user.fullname},</p>
         <p>Your registration as a <b>Solar Entrepreneur</b> has been approved.</p>
         <p>Regards,<br/>Brihaspathi Technologies Ltd</p>`
      );
    }

    res.json({ message: `Approved ${users.length} users successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
