const express=require('express');
const router=express.Router();
const ownerController=require("../controllers/ownerController");
const upload = require('../helpers/multer');


router

.post('/register',upload.single('profilePicture'),ownerController.register);

module.exports=router;