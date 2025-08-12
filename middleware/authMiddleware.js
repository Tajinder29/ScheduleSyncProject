export function isAuthentication(req,res,next){
if(req.session.User){
    next();
}
else{
     res.redirect("/login.html");
}
}
export function isAdmin(req,res,next){
    if(req.session.User && req.session.User.role==="Admin"){
    next();
    }
    else{
        res.status(403).send("Access denied: Admins only");
    }
}
export function isTeacher(req,res,next){
    console.log("Session in isTeacher:", req.session);
    if(req.session.User && req.session.User.role==="Teacher"){
           console.log("Teacher authenticated");
     next();
    }
    else{
        console.log("Access denied:", req.session.User);
        res.status(403).send("Access denied: Teacher only");
    }
}
