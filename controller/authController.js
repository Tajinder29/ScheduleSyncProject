import Teacher from "../models/teacher.js"
export const signup=async(req,res)=>{
 const {email,password,role}=req.body;
try{
  const existingUser=await Teacher.findOne({email});
  if(existingUser){
    return res.status(500).json({message:"Email already registered!"});
  }
  const newUser=new Teacher({email,password,role,timetable:[]});
  await newUser.save();
   res.status(200).json({ message: 'Signup successful!' });
}
catch(err){
   console.error("Signup error:", err);
res.status(500).json({message:"Server error!"});
}
 
};
export const login=async(req,res)=>{
    const {email,password}=req.body;//,role
  try{
    const user=await Teacher.findOne({email,password});//,role
  if(user){
     req.session.isAuthentication = true;
    req.session.User={ email:user.email , role:user.role};
    res.status(200).json({ message: "Login successful!" ,role:user.role});
  }
  else{
    res.status(401).json({message:"Invalid Credentials!"});
  }
  }
  catch(err){
    res.status(500).json({ message: 'Server error' });
  }

};

export const logout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      console.log(err);
      return res.status(500).send("logout failed");
    }
  
   res.clearCookie("connect.sid");
    res.redirect("/login"); 
  })
}
