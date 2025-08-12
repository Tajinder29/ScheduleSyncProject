document.addEventListener("DOMContentLoaded",()=>{
//   function toMinutes(timeStr) {
//   const [hours, minutes] = timeStr.split(":").map(Number);
//   return hours * 60 + minutes;
// }
  const container=document.getElementById("dynamic-container");
  fetch("/route/getAllTeacherLeaves")
  .then(res=>res.json())
  .then((leaveRequest)=>{
   if(!Array.isArray(leaveRequest)|| leaveRequest.length===0){
    container.innerHTML="<p>No leave requests found</p>";
    return;
   }
   const grouped=[];
   leaveRequest.forEach((req)=>{
    let existing=grouped.find(item=>item.email===req.teacherEmail);
    console.log(req.teacherEmail);
    if(existing){
    existing.requests.push(req);
    }
    else{
      grouped.push({email:req.teacherEmail,role:req.role,requests:[req]});
      //const role= req.role;
      
    }
   }) 
  grouped.forEach((teacher)=>{
   const emailDiv=document.createElement("div");
   emailDiv.className="teacher-email-block";
   emailDiv.innerHTML=`<h3>${teacher.email}</h3>`;

   teacher.requests.forEach((req)=>{
    console.log(req.lectures);//req.lectures
    const timetable=Array.isArray(req.lectures)?
    `<ul>`+req.lectures.map(lec=>//<strong>Lecture:</strong> ${lec.lecture} |
     `<li> 
      <strong>Subject:</strong> ${lec.subjectName} |
      <strong>Room:</strong> ${lec.roomNo} |
      <strong>Time:</strong> ${lec.startTime} - ${lec.endTime} </li>`).join("")+`</ul>`:"<li>No timetable found.</li>";
        const singleDiv=document.createElement("div");
  singleDiv.className="leave-request";
  singleDiv.innerHTML=`<strong>Date:</strong>${req.date}<br> <strong>Reason:</strong>${req.reason}<br>
   <strong>Timetable:</strong>${timetable}`;//timetable
      const buttonDiv=document.createElement("div");
 buttonDiv.className="buttonDiv";
 const buttonList=document.createElement("button");
 buttonList.textContent="Approve";
 buttonList.className="left-button";
 const Rejectbtn=document.createElement("button");
 Rejectbtn.textContent="Reject";
 Rejectbtn.className="right-button";
 buttonDiv.appendChild(buttonList);
 buttonDiv.appendChild(Rejectbtn);
  const statusDiv=document.createElement("div");
  statusDiv.className="status-badge pending";
  statusDiv.textContent=req.status;//pending
    if (req.status !== "Pending") {
     buttonList.style.display = "none";
      Rejectbtn.style.display = "none";
          }
   buttonDiv.appendChild(statusDiv);
   singleDiv.appendChild(buttonDiv);
  emailDiv.appendChild(singleDiv);
buttonList.addEventListener("click",async function(){
  try{
    const res=await fetch("/route/updateLeaveStatus",{
      method:'POST',
      headers:{"content-type":"application/json"},
      body:JSON.stringify({leaveId:req._id,newStatus:"Approved"})
    })
    if(res.ok){
      statusDiv.textContent="approved";
      statusDiv.className="status-badge approved";
      buttonList.style.display="none";
      Rejectbtn.style.display="none";
    }
    
  }catch(err){
    console.log(err);
  }
})
Rejectbtn.addEventListener("click",async function(){
  try{
    const res=await fetch("/route/updateLeaveStatus",{
      method:'POST',
      headers:{"content-type":"application/json"},
      body:JSON.stringify({leaveId:req._id,newStatus:"Rejected"})
    })
    if(res.ok){
      statusDiv.textContent="Rejected";
      statusDiv.className="status-badge rejected";
      buttonList.style.display="none";
      Rejectbtn.style.display="none";
    }
  }catch(err){
    console.log(err);
  }
})


      // buttonList.addEventListener("click",async()=>{
      //   const res=await fetch("/route/getAllTeacherData");
      //  const teachers=await res.json();
      
      //     const leaveDate=req.date;
      //     const lectureAvailable=Array.isArray(req.timetableForDate)?req.timetableForDate.map(lec=>{
      //       const start=toMinutes(lec.startTime);
      //       const end=toMinutes(lec.endTime);
      //       const available=teachers.filter(t=>{
      //         if(t.role !=="Teacher"||t.email===req.email)return false;
      //         return !(t.timetable||[]).some(l=>l.date===leaveDate && toMinutes(l.startTime)<end && toMinutes(l.endTime)>start);
      //       }).map(t=>({
      //         email:t.email,
      //         subjects:(t.timetable || []).map(l => l.subjectName),
      //         totalLectures: t.timetable?.length || 0

      //       }));
      //       return {...lec,available};
      //     }):[];

      //     const modal = document.getElementById("modal");
      //     const modalBody=document.getElementById("modal-body");
      //      modalBody.innerHTML = ""; 
      //      if(lectureAvailable.length===0){
      //        modalBody.innerHTML="<p>No teachers available</p>";
      //      } 
      //      else{
      //       modalBody.innerHTML=lectureAvailable.map(lec=>`<h4><strong>Lecture : ${lec.lecture}</strong> (${lec.startTime} - ${lec.endTime}) | <strong>${lec.subjectName}</strong></h4>
      //        ${lec.available.length==0 ? "<p>No teachers available for this lecture.</p>":lec.available.map(t=> `
      //               <div class="teacher-card">
      //                 <p><strong>Email:</strong> ${t.email}</p>
      //                 <p><strong>Subjects:</strong> ${t.subjects.join(", ")}</p>
      //                 <p><strong>Total Lectures:</strong> ${t.totalLectures}</p>
      //                 <button class='sendRequest'>Send Request</button>
      //               </div>
      //             `).join("")}<hr> `).join("");
      //      }          
      //     modal.style.display = "block";
      // })

   })
      container.appendChild(emailDiv);
  })
});
const modal=document.getElementById("modal");
const closebtn=document.querySelector(".close-button");
closebtn.addEventListener("click",()=>{
  modal.style.display="none";
})
   })
  