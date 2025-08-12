document.addEventListener("DOMContentLoaded",function(){
function toMinutes(dateStr) {
   if (!dateStr || typeof dateStr !== "string") {
        console.warn("Invalid date passed to toMinutes:", dateStr);
        return 0; 
    }
    // if (!dateStr || typeof dateStr !== "string") return NaN;
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return Math.floor(date.getTime() / 60000);
}
function parseTime(timeStr) {
  if(!timeStr) return null;
const [hours, minutes] = timeStr.split(":").map(Number);
return hours * 60 + minutes; // convert to total minutes
}

    function updateTimeandDate(){
const now=new Date();
document.getElementById("date").innerHTML=now.toLocaleDateString();
document.getElementById("time").innerHTML=now.toLocaleTimeString();
}    
updateTimeandDate();
setInterval(updateTimeandDate, 30000);

const container=document.getElementById("dynamic-leaves");
fetch("/route/getAllApprovedLeaves",{
   method: "GET",
  credentials: "include"
})

.then(res=>res.json())
.then((data)=>{
    if(!Array.isArray(data)|| data.length===0){
        container.innerHTML="<p>No leave available";
        return;
    }
data.forEach(req=>{
  if (!Array.isArray(req.lectures) || req.lectures.length === 0) return;
    req.lectures.forEach(lec=>{
        const leaveCard=document.createElement("div");
    leaveCard.className="leave-card";
    leaveCard.innerHTML=`<li><strong>Teacher:</strong>${req.teacherEmail}<br><strong>Leave:</strong>${req.date}<br><strong>Subject:</strong>${lec.subjectName} | <strong> Time:</strong> ${lec.startTime} - ${lec.endTime} </li>`;
    const button=document.createElement("button");
    button.innerText="+ Add Adjustment";
    button.className="button";
    button.addEventListener("click",async()=>{
        try{
         const res=await fetch("/route/getAllTeacherData",{
          method: "GET",
          credentials: "include"
         });
         const teachers=await res.json();
         const leaveDate=req.date;
         const leavestart=parseTime(lec.startTime);
         const leaveEnd=parseTime(lec.endTime);
        
         const availableTeachers=teachers.filter((t)=>{
            if(t.role!=="Teacher"||t.email===req.teacherEmail)
                return false;
            const lecturesOnDate = (t.timetable?.lectures || []).filter(
                    (l) =>l.date && toMinutes(l.date) === toMinutes(leaveDate));
            const hasConflict=lecturesOnDate.some((l)=>{
                const lstart=parseTime(l.startTime);
                const lEnd=parseTime(l.endTime);
                return lstart<leaveEnd && lEnd>leavestart;
            })
            return !hasConflict;
         }).map((t)=>{
            const lecturesOnDate = (t.timetable?.lectures || []).filter(
                    (l) =>l?.date && toMinutes(l.date) === toMinutes(leaveDate));
            const subject=lecturesOnDate.map((l) => l.subjectName);
            //const totalLectures=lecturesOnDate.length;
             console.log("Teacher:", t.email, "Lectures:", t.timetable?.lectures);
            return{
                email:t.email,
                subject:[...new Set(subject)],
                totalLectures:lecturesOnDate.length,
            };
           
         })
         
         const modal=document.getElementById("modal");
         const modalBody=document.getElementById("modal-body");
         modalBody.innerHTML=`<span id="closeModalBtn" style="float:right;cursor:pointer;font-size:20px;">&times;</span>  <h3>Lecture: ${lec.subjectName} (${lec.startTime} - ${lec.endTime})</h3>${
            availableTeachers.length===0? "<p>No teachers available</p>":availableTeachers.map((t)=>`<div class="teacher-card" data-email="${t.email}">
                          <p><strong>Email:</strong> ${t.email}</p>
                          <p><strong>Subjects:</strong> ${t.subject?.join(", ")}</p>
                          <p><strong>Total Lectures:</strong> ${t.totalLectures}</p>
                          <button class='sendRequest'>Send Request</button>
                        </div>`).join("")
         }`;
         modal.style.display = "block";

document.querySelectorAll(".sendRequest").forEach(btn => {
  btn.addEventListener("click", async () => {

   const card = btn.closest(".teacher-card");
    const toEmail = card.getAttribute("data-email"); 
    console.log("Send Request to:", toEmail);
    try {
      const response = await fetch("/route/sendAdjustmentRequest", {
        method: "POST",
          credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: toEmail,
        from: req.teacherEmail,
       date: req.date,
       day:lec.day,
        lectureNo: lec.lecture,
         roomNo: lec.roomNo || "",
      startTime: lec.startTime,
     endTime: lec.endTime,
     subject: lec.subjectName,
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Adjustment request sent to " + toEmail);
        modal.style.display = "none";
      } else {
        alert("Failed to send request: " + result.message);
      }
    } catch (err) {
      console.error("Error sending adjustment request:", err);
    }
  });
});



         document.getElementById("closeModalBtn").onclick=()=>{
             modal.style.display = "none";
         }
         window.onclick=function(event){
             if (event.target === modal) {
                  modal.style.display = "none";
                }
         }
        }catch(err){
          console.error("Error fetching teacher data:", err);
        }
    })
    leaveCard.appendChild(button);
    container.appendChild(leaveCard);
    })
    
})

})
.catch(err=>{
    console.error("Failed to fetch leaves:", err);
 })
})

document.getElementById("logoutBtn").addEventListener("click", () => {
    fetch("/route/logout", {
        method: "GET",
        credentials: "include"
    })
    .then(() => {
        window.location.href = "/login";
    })
    .catch(err => {
        console.error("Logout failed", err);
        alert("Logout failed. Try again.");
    });
});




