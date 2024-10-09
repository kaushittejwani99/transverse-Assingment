const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const upload=require("../helpers/multer");
const{verifyToken}=require("../../jwt");

// Route for registering a new business
router.post('/register',upload.single('businessImage') ,businessController.registerBusiness);
router.get('/getBusinessDetails',verifyToken,businessController.getBusinessDetails);

module.exports = router;
