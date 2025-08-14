import mongoose from 'mongoose';
const teacherSchema =new mongoose.Schema({
     name: String,
  email: String,
  password: String,
  role: { type: String},
  profileImage: { type: String, default: 'default.jpg' },
  resetOTP: { type: String },
  resetOTPExpires: { type: Date }
})
const Teacher=mongoose.model('Teacher', teacherSchema);
export default Teacher;