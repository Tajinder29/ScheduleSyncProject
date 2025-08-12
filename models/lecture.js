import mongoose from "mongoose";
const lectureSchema = new mongoose.Schema({
 day: { type: String, required: true },
  date: { type: String, required: true },
  lecture: { type: String, required: true },
  subjectName: { type: String, required: true },
  roomNo: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true }
});
const Lecture=mongoose.model('Lecture', lectureSchema);
export default Lecture ;