import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  day: String,
  date: String,
  lecture: String,
  subjectName: String,
  roomNo: String,
  startTime: String,
  endTime: String
});

const timetableSchema =new mongoose.Schema({
    teacherEmail: {
    type: String,
    required: true, unique: true
  },
  lectures: [lectureSchema]
})
const Timetable=mongoose.model('Timetable', timetableSchema);
export default Timetable;
