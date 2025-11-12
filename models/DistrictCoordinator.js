import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const districtCoordinatorSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false }, // select:false = hide by default
    district: { type: String, required: true, trim: true },
    role: { type: String, default: "district" },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ Automatically hash password before saving
districtCoordinatorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("DistrictCoordinator", districtCoordinatorSchema);
