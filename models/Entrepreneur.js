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
    status: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Entrepreneur", EntrepreneurSchema);
