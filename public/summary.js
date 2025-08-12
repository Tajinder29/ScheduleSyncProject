document.addEventListener("DOMContentLoaded",function(){

    function updateDateTime(){
    setInterval(()=>{
        const now=new Date();
        document.getElementById("date").innerHTML=now.toLocaleDateString();
        document.getElementById("time").innerHTML=now.toLocaleTimeString();
    },1000);
}
const loginEmail=localStorage.getItem("loginEmail");
const username=localStorage.getItem("username");
fetch(`/route/getTimetable/${loginEmail}`)
.then(res=>res.json())
.then(timetable =>{
    let done=0,left=0;
    const totalLectures=timetable.length;
    timetable.forEach(item => {
        if(isLecture(item.day , item.endTime)){
            done++;
        }
        else{left++;}
    });
    document.getElementById("username").innerText=username;
   document.getElementById("totalectures").innerText = totalLectures;
    document.getElementById("totaldone").innerText = done;
    document.getElementById("totaleft").innerText = left;
})
.catch(err=>{
    alert("something went wrong");
console.error("Fetch error:", err);
})
updateDateTime();
})
function isLecture(day,endTime){
const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const today=new Date();
const todayDay=days[today.getDay()-1];
if(days.indexOf(day)<days.indexOf(todayDay)){
    return true;
}
else if(day===todayDay){
    const currentTime=today.getHours()+":"+today.getMinutes().toString().padStart(2,'0');
    return currentTime>=endTime;
}
else{
    return false;
}
}
