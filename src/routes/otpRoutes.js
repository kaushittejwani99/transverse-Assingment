const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpControllers');

// Routes
router.post('/email/send-otp', otpController.sendOTP);  // Send OTP to email
router.post('/email/verify-otp', otpController.verifyOTP);  // Verify OTP
router.post('/phone/send-otp',otpController.sendOtpToPhoneNumber); //send otp to phone
router.post('/phone/verify-otp',otpController.phoneNumberVerifyOTP);//verify OTP


module.exports = router;
