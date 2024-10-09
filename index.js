const express=require('express');
const app=express();
require('dotenv').config();
const owner= require('./src/routes/ownerRoute');
const business=require('./src/routes/businessRoute');
const otp=require("./src/routes/otpRoutes");
const cors = require('cors')
const connectDB= require('./src/connection/conn');
app.use(express.json());



app.use(cors());

connectDB()

// Serve the uploads folder statically so images can be accessed via URL
app.use('/uploads', express.static('uploads'));



// If you want to support URL-encoded bodies (optional)
app.use(express.urlencoded({ extended: true }));


app.use('/api/owner',owner);
app.use('/api/business',business);
app.use("/auth",otp)

const port=process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`app listen successfully  ${port}`);
})