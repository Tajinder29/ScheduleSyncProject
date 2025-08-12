// models/Leave.js
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  teacherEmail: String,
  reason: String,
  date: String,
  lectures: [  // lectures being left
    {
      day: String,
      lecture:String,
      subjectName: String,     
      roomNo: String ,
      startTime: String,
      endTime: String,
    },
  ],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

export default mongoose.model('Leave', leaveSchema);
