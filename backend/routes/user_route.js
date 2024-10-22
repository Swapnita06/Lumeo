const express = require('express')
const Router = express.Router();
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
require('dotenv').config()
const User = require('../models/User');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET 
});


//this is for signup
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


//this is for login.
Router.post('/login',async(req,res)=>{
    console.log(req.body)
    try{
        console.log(req.body)
        const users = await User.find({email:req.body.email})
        console.log(users)
        if(users.length==0){
            return res.status(500).json({
                error:'email is not registered...'
            })
        }

const isValid = await bcrypt.compare(req.body.password,users[0].password)
console.log(isValid)
if(!isValid){
    return res.status(500).json({
        error:'invalid password'
    })
}

const token = jwt.sign({
    _id:users[0]._id,
    channelName:users[0].channelName,
    email:users[0].email,
    phone:users[0].phone,
    logoId:users[0].logoId
},
'swapnita singh',
{
    expiresIn:'365d'
}
)
res.status(200).json({
    _id:users[0]._id,
    channelName:users[0].channelName,
    email:users[0].email,
    phone:users[0].phone,
    logoId:users[0].logoId,
    logoUrl:users[0].logoUrl,
    token:token,
    subscribers:users[0].subscribers,
    subscribedChannels:users[0].subscribedChannels
})

    }
    catch(err){
        console.log(err)
        res.status(500).json({
            error:'something is wrong!'
        })
    }
})

module.exports = Router