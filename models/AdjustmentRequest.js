import mongoose from "mongoose";

const adjustmentSchema = new mongoose.Schema({
  to: String,         
  from: String,       
  date: String,
  day: String,       
  startTime: String,
  endTime: String,
  subject: String,
  lectureNo: Number, 
  roomNo: String ,
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
});

export default mongoose.model("AdjustmentRequest", adjustmentSchema);