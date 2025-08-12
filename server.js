import express from 'express';
 import path from 'path';
 import session from 'express-session';
 import { dirname } from 'path';
import { fileURLToPath } from 'url';
import router from './router/user.js';
import { isAuthentication,isAdmin,isTeacher} from './middleware/authMiddleware.js';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);//current directory name
const __dirname = dirname(__filename); 
const app=express();
app.use(express.json());
const Port=3000;
connectDB();
app.use(express.static(path.join(__dirname,'public')));
app.use("/uploads",express.static(path.join(__dirname,"uploads")));
app.use(session({
    secret:'Tajinder',
    saveUninitialized:false,//apne aap session create nhi krega
    resave:false//automatically save nhi hoga
}))
app.get("/", (req, res) => {
    if(req.session.User && req.session.User.role==="Admin"){
        return res.redirect("/table");
    }
    if(req.session.User && req.session.User.role==="Teacher"){
        return res.redirect("/Teachertable");
    }
    res.sendFile(path.join(__dirname,'public', "signup.html"));
});  
app.get("/login",(req,res)=>{
    if (req.session.User && req.session.User.role === "Admin") {
        return res.redirect("/table");
    }
    if (req.session.User && req.session.User.role === "Teacher") {
        return res.redirect("/Teachertable");
    }
res.sendFile(path.join(__dirname,'public',"login.html"));
})
app.get("/table",isAuthentication,isAdmin,(req,res)=>{
res.sendFile(path.join(__dirname,'public',"table.html"));
})
app.get("/Teachertable",isAuthentication,isTeacher,(req,res)=>{
    res.sendFile(path.join(__dirname,'public','Teachertable.html'));
})
app.get("/admin",isAuthentication,isAdmin,(req,res)=>{
    res.sendFile(path.join(__dirname,'public','admin.html'));
})
app.use('/route',router);

app.listen(Port,()=>{console.log(`server running at http://localhost//${Port}`)});



