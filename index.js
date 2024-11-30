import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import notificationRoute from './routes/notificationRoute.js'
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser'
import cloundinary from 'cloudinary';
import cors from 'cors'



dotenv.config()
cloundinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
    api_key:process.env.CLOUDINARY_API_KEY ,
    api_secret:process.env.CLOUDINARY_API_SECRET ,
})
const app=express();
const PORT=process.env.PORT
app.use(cors({
    origin: '*',  // For development
    credentials: true
  }));
  
connectDB()

app.get('/',(req,res)=>{
  
    res.status(200).json({
        message:"ok",
        "value":"API IS WORKING FINE"
    })
})

app.use(express.json(
    {

        limit:"5mb"
    }
))
app.use(cookieParser());
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/posts',postRoutes)
app.use('/api/notification',notificationRoute)


app.listen(PORT,(req,res)=>{
    console.log("App is started in the PORT",PORT);
   
})