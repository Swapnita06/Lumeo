const express = require('express')
const Router = express.Router();
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const User = require('../models/User');
const mongoose = require('mongoose');

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});

Router.post('/signup', async(req,res)=>{
    try{
        const users =  await User.find({email:req.body.email})
        if(users.length>0)
        {
            return res.status(500).json({
                error:'email already exists!'
             
            })
        }
       const hashCode= await bcrypt.hash(req.body.password,10) 
       const uploadedImg = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
      
       const newUser = new User({
        _id:new mongoose.Types.ObjectId,
        channelName:req.body.channelName,
        email:req.body.email,
        phone:req.body.phone,
        password:hashCode,
        logoUrl:uploadedImg.secure_url,
        logoId:uploadedImg.public_id
       })

       const user = await newUser.save();
       res.status(200).json({
        newUser:user
       })

    }catch(err){
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

module.exports = Router