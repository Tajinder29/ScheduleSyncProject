document.addEventListener("DOMContentLoaded",function(){
document.getElementById("leaveForm").addEventListener("submit",function(e){
    e.preventDefault();
    const date=document.getElementById("date").value;
const reason=document.getElementById("textarea").value;
const loginEmail=localStorage.getItem("loginEmail");
if(!loginEmail ){
    alert("login first");
    return;
}
if( !date || !reason){
    alert("fill date and reason");
    return;
}
    fetch("/route/getdata",{
        method:"POST",
        credentials:"include",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({email:loginEmail,date,reason})
    })
    .then(res=>res.json())
    .then(data=>{
        alert("data submit");
        console.log(data.message);
        window.location.href="/Teachertable";
    })
    .catch(err=>{
        console.log(err);
        alert("something is wrong");
    })

})
fetch("/route/getAllLeaves")
.then(res=>res.json())
.then(data=>{
     const container=document.getElementById('all-leaves-container');
    if(!Array.isArray(data)||data.length===0){
    container.innerHTML="<p>No leave requests found.</p>";
    return;
    }
    container.innerHTML="";
    data.forEach(req => {
        const lectureHTML=`<ul>`+req.lectures.map(lec=>
            `<li> <strong> Subject:</strong>${lec.subjectName} |
            <strong> Rooms:</strong>${lec.roomNo} |<strong> Time:</strong> ${lec.startTime} - ${lec.endTime}
            </li>`).join("")+`</ul>`;
             
        const leaveCard=document.createElement("div");
        leaveCard.className="leave-card";
        leaveCard.innerHTML=`<li><strong>Date:</strong>${req.date}<br><strong>Reason:</strong>${req.reason}<br><strong>Status:</strong><span style="color:${req.status==="Approved"?"green":req.status==="Rejected"?"red":"orange"}">${req.status}</span><br>
        ${lectureHTML}`; 
        container.appendChild(leaveCard);
        })
        
    })
    .catch(err=>{
     console.error("Failed to fetch leaves:", err);
    })
})
