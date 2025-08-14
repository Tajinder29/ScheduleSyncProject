import OTP from "../models/otp.js";
import Teacher from "../models/teacher.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();//.env file load krne ke liye
export const forgotPassword=async(req,res)=>{
  try{
    const { email } = req.body;
  const user= await Teacher.findOne({email});
  if(!user){
    return res.status(404).json({message: "User not found"});
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
   user.resetOTP = otp;
     user.resetOTPExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    const transporter = nodemailer.createTransport({
         host: "smtp.office365.com",//ye outlook ka smtp server hai  
        port: 587,
         secure: false,
        auth: {
    user: process.env.EMAIL_USER, // tumhara Outlook email
    pass: process.env.EMAIL_PASS  // tumhara Outlook password
  },
  // tls: {
  //   ciphers: "SSLv3",
  //    rejectUnauthorized: false
  // }
    //   service: "gmail",
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    });
    await transporter.sendMail({
      from: `"Schedule Sync" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });
     res.json({ message: "OTP sent to email" });
  }
  catch(err){
  res.status(500).json({ message: err.message });
  }
  
  
}
export const resetPassword=async(req,res)=>{
    try{
         const { email, otp, newPassword } = req.body;
         const user = await Teacher.findOne({
         email,
         resetOTP: otp,
         resetOTPExpires: { $gt: Date.now() }
      });

    if (!user) return res.status(400).json({ message: "Invalid or expired OTP" });
      user.password = newPassword;
      user.resetOTP="";
      user.resetOTPExpires="";
      await user.save();
      res.json({ message: "Password reset successful" });
    }
    catch(err){
        res.status(500).json({ message: err.message });
}
}



