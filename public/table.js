document.addEventListener("DOMContentLoaded",async()=>{

    function normalizeLecture(lecture) {
  if (!lecture) return null;
  const match = lecture.toString().match(/\d+/);
  return match ? match[0] : lecture.toString();
}

    const emailSelect=document.getElementById("select");
    let button=document.getElementById("button");
        button.addEventListener("click",function(){
          window.location.href="/admin";
        })
        try{
            const response=await fetch('/route/getAllTeacherEmails');
            const teachers=await response.json();
            emailSelect.innerHTML="";
            const defaultOption=document.createElement("option");
            defaultOption.disabled=true;
            defaultOption.selected=true;
            defaultOption.textContent="Select Email";
            emailSelect.appendChild(defaultOption);
            teachers.forEach(teacher=>{
                const option=document.createElement('option');
                option.value=teacher.email;
                option.textContent=`${teacher.email}`;
                emailSelect.appendChild(option);
            })
        }catch(err){
            console.error("Error fetching teacher emails:", err);
        }

        emailSelect.addEventListener("change",function(){
            const newEmail=this.value;
            localStorage.setItem("selectedEmail",newEmail);
            renderEmail(newEmail);
            console.log(newEmail);
        });
        
        function updateTimetable(email, day, lecture, subjectName, roomNo, startTime, endTime){//,role
         fetch("/route/updateTimetable",{
           method:"POST",
           headers:{"Content-type":"application/json"},
           body:JSON.stringify({email, day, lecture, subjectName, roomNo , startTime, endTime})//,role
           
         })
         .then(res=>res.json()) 
         .then(data=>{
        console.log("Updated:", data);
         renderEmail(email);
    })
         .catch(err=>console.log(err))
        }
        function renderEmail(selectedEmail){
//             const table = document.getElementById(`timetable-${selectedEmail}`);
// if (table) {
//     table.querySelectorAll("td[id]").forEach(td => td.innerHTML = "");
// }
 document.querySelectorAll("td[id]").forEach(td => td.innerHTML = "");
            // document.querySelectorAll(`#timetable-${selectedEmail} td[id]`).forEach(td => td.innerHTML = "");
            fetch(`/route/getTimetable/${selectedEmail}`)//selectedEmail
            .then(res=>res.json())
            .then(timetable=>{
                console.log(timetable);
            timetable.forEach(item =>{
                // const lectureNumber = item.lecture.replace(/\D/g, ''); // "Lecture 1" -> "1"
                 const lectureNumber = normalizeLecture(item.lecture);
                 const cellId = `${item.day}-${lectureNumber}`;

                    //const cellId=`${item.day}-${item.lecture}`;
                   // console.log(item.lecture);
                    console.log(cellId);
                 const cell=document.getElementById(cellId);
                 if(cell){
                    cell.innerHTML=`${item.subjectName}<br> Room: ${item.roomNo}`;
                cell.onclick=function(){
                    document.getElementById("subjectInput").value=item.subjectName;
                    document.getElementById("roomInput").value=item.roomNo;
                    document.getElementById('currentDay').value=item.day;
                    document.getElementById("currentLecture").value=item.lecture;//item.lecture
                    new bootstrap.Modal(document.getElementById("editModal")).show();
                }
                }
                    
            });
            })
            .catch(err=>console.log(err));
            
        }

        document.getElementById("saveBtn").addEventListener("click",function(){
         const subject=document.getElementById("subjectInput").value;
         const room=document.getElementById("roomInput").value;
         const day= document.getElementById('currentDay').value;
         const lecture= document.getElementById("currentLecture").value;
         const selectedEmail =emailSelect.value;
         const cellId=`${day}-${lecture}`;
         console.log(cellId);
         const cell=document.getElementById(cellId);
          cell.innerHTML=`${subject}<br> Room:${room}`;
          const startTime="";
          const endTime="";
         updateTimetable(selectedEmail, day, lecture, subject, room, startTime, endTime);//,role
         bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
         
        })

        window.onload=function(){
            const selectedEmail = localStorage.getItem("selectedEmail")||emailSelect.value;
            if(selectedEmail){
                emailSelect.value=selectedEmail;
                renderEmail(selectedEmail);
            }
        };
        

    });