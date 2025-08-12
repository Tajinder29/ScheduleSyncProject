//import { upload } from "../controller/multerConroller";
function normalizeLecture(lecture) {
  if (!lecture) return null;
  const match = lecture.toString().match(/\d+/);
  return match ? match[0] : lecture.toString();
}
const emailSelect=document.getElementById("select");
const username=localStorage.getItem("username");
const loginEmail=localStorage.getItem("loginEmail");
document.getElementById("username").innerText=username;
const profileImage =document.getElementById("profilePic");
const uploadPopup=document.getElementById("uploadPopup");
profileImage.addEventListener("click",function(event){
    if(uploadPopup.style.display==="none"){
        uploadPopup.style.display="block";
    }
    else{
        uploadPopup.style.display="none";
    }
})
document.addEventListener("click",function(event){
if(!uploadPopup.contains(event.target) && event.target!==profileImage){
    uploadPopup.style.display="none";
}
});


function loadImage(email){
    fetch(`/route/getUserImage/${email}`)
.then(res=>res.json())
.then(data=>{
    if(data.imageUrl){
        document.getElementById("profilePic").src=data.imageUrl;
    }
});
} 
// loadImage();
document.getElementById("uploadForm").addEventListener("submit", function(e){
    e.preventDefault();
    fetch("/route/session/email")
        .then(res => res.json())
        .then(data => {
            if (!data.email) return alert("Session expired");
            
            const formData = new FormData();
            formData.append("profilePic", document.getElementById("profileImageInput").files[0]);
            
            fetch(`/route/uploadImage?email=${data.email}`, {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert("Image Uploaded");
                document.getElementById("profilePic").src = data.imageUrl;
                document.getElementById("uploadPopup").style.display = "none";
            })
            .catch(err => {
                console.error(err);
                alert("Failed to upload image");
            });
        });
});


// function normalizeLecture(lecture) {
//     if (!lecture) return "";
//     return lecture.toString().replace(/lecture\s*/i, "").trim();
// }
function ShowData(selectedEmail){
     document.querySelectorAll("td[id]").forEach(td => td.innerHTML = "");
    // document.querySelectorAll("td[id*='Lecture']").forEach(td => td.innerHTML = "");
    fetch(`/route/getTimetable/${selectedEmail}`)

    .then(res=>res.json())
    .then(timetable=>{
        console.log("Fetched timetable for:", selectedEmail, timetable);
        timetable.forEach(item => {
            //  const lectureNumber = item.lecture.toString().replace(/Lecture\s*/i, "").trim();
            // const lectureNumber = item.lecture.replace(/\D/g, '');
             const lectureNumber = normalizeLecture(item.lecture);
            // console.log( "Extracted lectureNumber:", lectureNumber);
             const cellId = `${item.day}-${lectureNumber}`;
            // console.log("Placing lecture at cell:", cellId, item);
             // cellId=`${item.day}-${item.lecture}`;
            const cell=document.getElementById(cellId);
            console.log(cell);
            if(cell){
                cell.innerHTML=`${item.subjectName}<br>Room:${item.roomNo}`;
            }
        }); 
    })
}

fetch("/route/adjustment/inbox" ,{ credentials: "include" })
    .then(res => res.json())
    .then(requests => {
        if (!Array.isArray(requests)) {
      console.error("Invalid response:", requests);
      return;
    }
      const container = document.getElementById("inbox-container");
      if (requests.length === 0) {
        container.innerHTML = "<p>No adjustment requests.</p>";
        return;
      } else {
        container.innerHTML = requests.map(req => `
          <div class="request-box" data-request-id="${req._id}" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
            <p><strong>From:</strong> ${req.from}</p>
            <p><strong>Date:</strong> ${req.date}</p>
            <p><strong>Day:</strong> ${req.day}</p>
            <p><strong>Time:</strong> ${req.startTime} - ${req.endTime}</p>
            <p><strong>Subject:</strong> ${req.subject}</p>
            <p><strong>Lecture No:</strong> ${req.lectureNo}</p>
            <p><strong>Room No:</strong> ${req.roomNo || ""}</p>
            ${req.status === 'Pending' ? `
      <button class="Accept-btn">✅ Accept</button>
      <button class="Reject-btn">❌ Reject</button>
    ` : `<p><em>Status: ${req.status}</em></p>`}
          </div>
        `).join("");
        
      }
    });
 document.addEventListener("click",function(e){
    if(e.target.classList.contains("Accept-btn")){
        const requestBox=e.target.closest(".request-box");
        const requestId = requestBox.getAttribute("data-request-id"); 
        const Email=requestBox.querySelector("p:nth-of-type(1)").textContent.split(":")[1].trim();
        const date=requestBox.querySelector("p:nth-of-type(2)").textContent.split(":")[1].trim();
        const day = requestBox.querySelector("p:nth-of-type(3)").textContent.split(":")[1].trim();
        const time=requestBox.querySelector("p:nth-of-type(4)").textContent.replace("Time:","").trim();
        const subject=requestBox.querySelector("p:nth-of-type(5)").textContent.split(":")[1].trim();
         const lecture = requestBox.querySelector("p:nth-of-type(6)")?.textContent.split(":")[1].trim();
        const roomNo = requestBox.querySelector("p:nth-of-type(7)").textContent.split(":")[1].trim() || "";
        const [startTime,endTime]=time.split("-").map(t=>t.trim());
        fetch("/route/session/email")
        .then(res=>res.json()) 
        .then(data=>{
            const teacherEmail=data.email;
            const updateData={
                email:teacherEmail,
                date,
                day,
                lecture,
                roomNo,
                startTime,
                endTime,
                subjectName:subject,
            };
               console.log("Sending update data:", updateData); 
            fetch("/route/updateTimetable",{
                method:"POST",
                headers:{"content-type":"application/json"},
                body:JSON.stringify(updateData)   
        }).then(res=>res.json())
        .then(data=>{
            alert(data.message);
            fetch("/route/updateAdjustmentRequestStatus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ requestId, newStatus: "Accepted" })
                })
                .then(res => res.json())
                .then(resData => {
                    // Hide Accept/Reject buttons
                    const acceptBtn = requestBox.querySelector(".Accept-btn");
                    const rejectBtn = requestBox.querySelector(".Reject-btn");
                    if (acceptBtn) acceptBtn.style.display = "none";
                    if (rejectBtn) rejectBtn.style.display = "none";

                    // Show status text
                    let statusText = document.createElement("p");
                    statusText.innerHTML = `<em>Status: Accepted</em>`;
                    statusText.style.color = "green"; 
                    requestBox.appendChild(statusText);

                    // Refresh timetable display
                    ShowData(teacherEmail);
                })
                .catch(err => {
                    console.error("Error updating adjustment request status", err);
                    alert("Failed to update adjustment status");
                });
            //  ShowData(teacherEmail);
        })
        .catch(err=>{
           console.error("Error accepting request", err);
            alert("Failed to accept request");
        })
    })
}
 })

function logout(){
    fetch("/route/logout")
    .then(res=>{
        if(res.redirected){//agar server side pe login page redirect hua hai to ise true assign hoga 
            window.location.href=res.url;//res.url contain the full url like http://localhost:3000/login.html
        }
    });
}

window.onload=function(){
            // const loginEmail = localStorage.getItem("loginEmail");
            fetch("/route/session/email")
            // console.log(loginEmail);
            // if(loginEmail){
            //     ShowData(loginEmail);
            // }
            .then(res => res.json())
        .then(data => {
            if (data.email) {
                console.log("Current Teacher:", data.email);
                document.getElementById("username").innerText = username;
                 loadImage(data.email);
                ShowData(data.email);
            } else {
                console.log("No session found for teacher");
            }
        })
        .catch(err => console.error("Error fetching session email:", err));
        };


//         window.onload = function () {
//   fetch("/route/session/email")
//     .then(res => res.json())
//     .then(data => {
//       if (data.email) {
//         ShowData(data.email);
//       }
//     });
// };