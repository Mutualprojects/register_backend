import mongoose from "mongoose";

const EntrepreneurSchema = new mongoose.Schema(
  {
    fullname: String,
    email: String,
    mobile: String,
    formState: String,
    formDistrict: String,
    formCity: String,
    pincode: String,
    detectedLocation: {
      ip: String,
      country: String,
      state: String,
      district: String,
      coordinates: [Number], // [latitude, longitude]
    },

    // workflow status
    status: { type: String, default: "Pending" }, // 'Pending' | 'Accepted' | 'Rejected'

    // 👇 NEW: who last acted on this record
    approvedByRole: {
      type: String,
      enum: ["admin", "coordinator", "none"],
      default: "none",
    },
    approvedById: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      // If your admins & coordinators are in different models, keep ref optional or use refPath (see note below)
      // ref: "User",
    },

    // (optional) dynamic ref if you store admins in "User" and coordinators in "DistrictCoordinator"
    // approvedByModel: {
    //   type: String,
    //   enum: ["User", "DistrictCoordinator", null],
    //   default: null,
    // },
  },
  { timestamps: true }
);

/* Helpful indexes for faster queries/statistics */
EntrepreneurSchema.index({ formDistrict: 1, status: 1 });
EntrepreneurSchema.index({ approvedByRole: 1 });

export default mongoose.model("Entrepreneur", EntrepreneurSchema);
