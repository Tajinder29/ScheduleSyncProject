import mongoose from "mongoose";
export const connectDB = async (req,res)=>{
 try{
  await mongoose.connect("mongodb://127.0.0.1:27017/scheduleSync");
  console.log("MongoDB connected")
 }catch(err){
    console.error("MongoDB connection error:", err.message);
 }
}
export default connectDB;