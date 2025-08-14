import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, 
  role: { type: String, enum: ["Admin", "Teacher"], default: "Teacher" },
  resetOTP: String,
  resetOTPExpires: Date
});

export default mongoose.model("OTP", otpSchema);