import Timetable from "../models/Timetable.js";
import Teacher from "../models/teacher.js";
import Leave from "../models/leave.js";
import AdjustmentRequest from "../models/AdjustmentRequest.js"; 
export const getSessionEmail = (req, res) => {
  if (req.session && req.session.User && req.session.User.email) {
    return res.status(200).json({ email: req.session.User.email });
  } else {
    return res.status(401).json({ message: "Not authenticated" });
  }
};
export const updateTimetable=async(req,res)=>{
    const { email,role, day,date, lecture, subjectName, roomNo,startTime,endTime}=req.body;
//     if (!day || !date || !lecture || !subjectName || !roomNo || !startTime || !endTime) {
//     return res.status(400).json({ message: "All fields are required" });
// }
if (!lecture || lecture === "undefined") {
    return res.status(400).json({ message: "Lecture number is required" });
  }
      console.log("updateTimetable request body:", req.body);
    try{
        const all=await Timetable.find({});
        const currentTime=new Date();
        const conflict=all.some(t=>t.teacherEmail !== email &&
      (t.lectures||[]).some(l => l.day === day && l.lecture === lecture && l.roomNo === roomNo && new Date(l.date)>=currentTime));
      if(conflict){
        return res.status(400).json({ message: 'duplicacy occurs'});
      }
      let timetable=await Timetable.findOne({teacherEmail: email});
      if(!timetable){
        timetable=new Timetable({teacherEmail: email,lectures: []})
      }
      timetable.lectures=timetable.lectures.filter(l => !(l.day === day && l.lecture === lecture));

      timetable.lectures.push({ day, date, lecture, subjectName, roomNo, startTime, endTime });

    await timetable.save();
   let teacher=await Teacher.findOne({email});
   if(!teacher){
    teacher=new Teacher({
         name: "",  
    email: email,
    password: "",
    role: role 
    });
    await teacher.save();
//     const freshTimetable = await Timetable.findOne({ teacherEmail: email });
// return res.status(200).json({
//     message: "Timetable updated successfully!",
//     lectures: freshTimetable.lectures
// });
   }
   return res.status(200).json({
      message: "Timetable updated successfully!",
      lectures: timetable.lectures
    });
  //  return res.status(200).json({message: "Timetable updated successfully!",lectures: timetable.lectures});

    }catch(err){
       console.error("Error in updateTimetable:", err);
       res.status(500).json({ message: 'Server error', error: err.message });
    }
}
export const acceptAdjustmentRequest =async(req,res)=>{
  const {email, from, date, startTime, endTime, subjectName }=req.body;
  try{
    const leave= await Leave.findOne({
      teacherEmail: from,
      date: date,
      lectures: {
        $elemMatch: {
          startTime: startTime,
          subjectName: subjectName,
        },
      },
    })
     if (!leave) {
      return res.status(404).json({ message: "Leave data not found" });
    }
     const matchingLecture = leave.lectures.find(
      lec =>
        lec.startTime === startTime &&
        lec.subjectName === subjectName
    );
    if (!matchingLecture) {
      return res.status(404).json({ message: "Matching lecture not found in leave" });
    }
     const { day, roomNo, lecture } = matchingLecture;
     let timetable = await Timetable.findOne({ teacherEmail: email });
    if (!timetable) {
      timetable = new Timetable({ teacherEmail: email, lectures: [] });
    }

    const index = timetable.lectures.findIndex(
      l => l.day === day && l.lecture === lecture
    );

    const newLecture = {
      day,
      date,
      lecture,
      subjectName,
      roomNo,
      startTime,
      endTime,
    };

    if (index !== -1) {
      timetable.lectures[index] = newLecture;
    } else {
      timetable.lectures.push(newLecture);
    }

    await timetable.save();
    res.status(200).json({ message: "Lecture accepted and added to timetable" });
  }
  catch(err){
 console.error("Error accepting adjustment:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

export const getTimetable=async(req,res)=>{
    try{
        const email=req.params.email;
    const timetable=await Timetable.findOne({teacherEmail:email});
    if(!timetable){
        return res.status(404).json({ message: 'No timetable found' });
    }
      res.json(timetable.lectures);
      console.log('Returning timetable lectures:', timetable.lectures);
    }catch(err){
    res.status(500).json({ message: 'Server error' });
  }
}

export const getdata=async(req,res)=>{
    const {email,role,date,reason}=req.body;
    try{
        const timetable=await Timetable.findOne({teacherEmail:email});
        const timetableForDate=timetable?.lectures?.filter(item => item.date === date) || [];
        console.log(timetableForDate);
        const newLeave=new Leave({
            teacherEmail: email,
            role,
            date,
            reason,
           lectures: timetableForDate.map(({ day, lecture,subjectName, roomNo, startTime, endTime}) => ({
  day,lecture, subjectName, roomNo, startTime, endTime
}))
            
        })
        
        await newLeave.save();
         res.status(200).json({ message: 'Leave applied successfully!' });
    }
    catch(err){
    res.status(500).json({ message: 'Server error' });
    }
}

export const getAllTeacherLeaves=async(req,res)=>{
    try{
        const leaves=await Leave.find({});
      return  res.status(200).json(leaves);
    }catch(err){
        res.status(500).json({ message: 'Server error' });
    }
};
export const getAllTeacherData = async (req, res) => {
  try {
    const teachers = await Teacher.find({ role: "Teacher" });
    const timetables = await Timetable.find();

    const teacherData = teachers.map((teacher) => {
      // Find timetable for the current teacher
      let timetable = timetables.find((tt) => tt.teacherEmail === teacher.email);

      // If no timetable found, use empty lectures
      if (!timetable) {
        timetable = { lectures: [] };
      }

      return {
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
        timetable: timetable
      };
    });

    res.status(200).json(teacherData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const getAllTeacherEmails=async(req,res)=>{
    try{
     const teacher=await Teacher.find({role:"Teacher"}).select('email');
     return res.status(200).json(teacher);
    }catch(err){
      res.status(500).json({ message: "Server error" });
    }
}
export const updateLeaveStatus=async(req,res)=>{
  const {leaveId,newStatus}=req.body;
  try{
     await Leave.findByIdAndUpdate(leaveId,{status:newStatus},{new:true});
      res.status(200).json({ message: "Leave status updated" });
  }catch(err){
    res.status(500).json({ message: "Server error" });
  }
}
export const updateAdjustmentRequestStatus =async(req,res)=>{
  const { requestId, newStatus } = req.body; // newStatus = "Accepted" or "Rejected"

  try {
    const request = await AdjustmentRequest.findByIdAndUpdate(
      requestId,
      { status: newStatus },
      { new: true }
    );

    if (!request) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: `Request ${newStatus.toLowerCase()} successfully!` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
export const getAllLeaves=async(req,res)=>{
  try{
    const teacherEmail=req.session.User?.email;
    console.log("teacheremail",teacherEmail);
    if(!teacherEmail){
      return res.status(401).json({message:"This email id is not found"});
    }
    const leaves=await Leave.find({teacherEmail});
    res.json(leaves);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"getAllLeaves not working"});
  }
}
export const getAllApprovedLeaves=async(req,res)=>{
  try{
    const teacherEmail=req.session.User?.email;
    console.log("teacheremail",teacherEmail);
    if(!teacherEmail){
      return res.status(401).json({message:"This email id is not found"});
    }
    const leaves=await Leave.find({status:"Approved"});
    res.json(leaves);
  }catch(err){
    console.log(err);
    res.status(500).json({message:"getAllLeaves not working"});
  }
}
export const sendAdjustmentRequest = async (req, res) => {
  try {
    const { to, from, date,day, startTime, endTime, subject,lectureNo,roomNo } = req.body;
console.log(req.body);
    const request = new AdjustmentRequest({
      to,
  from,
  date,
  day,
  startTime,
  endTime,
  subject,
  lectureNo,
  roomNo
    });

    await request.save();
    res.status(200).json({ message: "Request sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send request" });
  }
};

export const getInboxRequests = async (req, res) => {
  try {
    // const email = req.params.email;
     const teacherEmail = req.session?.User?.email;
     if (!teacherEmail) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const requests = await AdjustmentRequest.find({ to:teacherEmail});
    res.json(requests);
  } catch (err) {
     console.error("Error fetching adjustment requests:", err);
    res.status(500).json({ error: "Failed to fetch inbox" });
  }
};
