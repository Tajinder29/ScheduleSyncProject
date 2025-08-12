//import express from 'express';
import path from 'path';
import fs, { readdirSync } from 'fs';
import multer from 'multer';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname=dirname(fileURLToPath(import.meta.url));
const storage=multer.diskStorage({
    destination:function(req,file,cb){
     cb(null,path.join(__dirname,"../uploads"));
    }, 
    filename:function(req,file,cb){
    
    const email = req.query.email.replace(/[@.]/g, "_"); // Use email to make filename unique
    const ext=path.extname(file.originalname);
    cb(null,`${email}${ext}`);
    }
}) 
export const upload=multer({ storage: storage});
export const uploadImage=(req,res)=>{
    const filepath=`/uploads/${req.file.filename}`;
    res.json({message:"Image uploaded successfully", imageUrl:filepath});
};
export const getUserImage=(req,res)=>{
    const email = req.params.email.replace(/[@.]/g, "_"); // match saved filename;
    const imagePath=path.join(__dirname,"../uploads");
    const file=fs.readdirSync(imagePath);
    const userImage=file.find(f=>f.startsWith(email));
    if(userImage){
        res.json({imageUrl:`/uploads/${userImage}`});
    }
    else{
        res.json({imageUrl:`/uploads/default.jpeg`});
    }
}
//  export default router;