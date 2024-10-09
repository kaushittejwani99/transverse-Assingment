const nodemailer = require('nodemailer');
const crypto = require('crypto');
const business = require('../dbModels/businessModel');
const owner = require('../dbModels/ownerModel');
const twilio = require('twilio');
const { number } = require('joi');

// Twilio setup for sending otp to the mobile number
const accountSid = process.env.ACCOUNT_ID;
const authToken = process.env.ACCOUNT_TOKEN;
const client = new twilio(accountSid, authToken);


// Nodemailer setup for sending emails
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to generate OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();  // 6-digit OTP
};

// Helper function to send OTP to the user's email
const sendEmail = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp} please do not share with anyone its expires in 15 minutes`,
    });
  } catch (error) {
    throw new Error(error);
  }
};

// Send OTP API - For both owner or business
exports.sendOTP = async (req, res) => {
  const { email, type, phoneNumber } = req.body;  // type could be 'owner' or 'business'

  try {
    let user;

    // Check if the type is 'owner' or 'business'
    if (type === 'owner') {
      user = await owner.findOne({
        $or: [
          { "verification.email.address": email },
          { "verification.phone.number": phoneNumber }
        ]
      });
    } else if (type === 'business') {
      user = await business.findOne({
        $or: [
          { "verification.email.address": email },
          { "verification.phone.number": phoneNumber }
        ]
      });
    } else {
      return res.status(400).json({ message: 'Invalid type. Use owner or business.' });
    }

    // Generate OTP and expiration time (valid for 5 minutes)
    const otp = generateOTP();
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;  // OTP valid for 5 minutes

    if (!user) {
      // Create new owner or business if it doesn't exist
      if (type === 'owner') {
        user = new owner({
          verification: {
            email: {
              address: email,
              otp: otp,
              otpExpiresAt: new Date(otpExpiresAt),
            },
            phone: {
              number: phoneNumber,
            }
          },
        });
      } else if (type === 'business') {
        user = new business({
          verification: {
            email: {
              address: email,
              otp: otp,
              otpExpiresAt: new Date(otpExpiresAt),
            },
            phone: {
              number: phoneNumber,
            }
          },
        });
      }
      await user.save();
    } else {
      // Update existing owner's or business' OTP and expiration time
      const updateVerificationDetails = {
        'verification.email.otp': otp,
        'verification.email.otpExpiresAt': new Date(otpExpiresAt),
      };

      if (type === 'owner') {
        await owner.updateOne(
          { _id: user._id },
          { $set: updateVerificationDetails }
        );
      } else if (type === 'business') {
        await business.updateOne(
          { _id: user._id },
          { $set: updateVerificationDetails }
        );
      }
    }

    // Send OTP to email
    await sendEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  // Verify OTP API
  exports.verifyOTP = async (req, res) => {
    const { email, otp, type } = req.body;
  
    try {
      let user;
  
      // Find user by email based on type
      if (type === 'owner') {
        user = await owner.findOne({ 'verification.email.address': email });
      } else if (type === 'business') {
        user = await business.findOne({ 'verification.email.address': email });
      } else {
        return res.status(400).json({ message: 'Invalid type. Use owner or business.' });
      }
  
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
  
      // Check if OTP matches and is not expired
      const storedOtp = user.verification.email.otp;
      const storedOtpExpiresAt = user.verification.email.otpExpiresAt;
  
      if (storedOtp === otp && new Date(storedOtpExpiresAt) > Date.now()) {
        // OTP is correct and not expired
        user.verification.email.otp = undefined;  // Clear OTP after verification
        user.verification.email.otpExpiresAt = undefined;
        user.verification.email.isVerified = true;  // Mark user as verified
  
        await user.save();
  
        res.status(200).json({ message: 'OTP verified, registration successful' });
      } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


exports.sendOtpToPhoneNumber = async (req, res) => {
  try {
    const { mobileNumber ,type,email} = req.body;


    if (type === 'owner') {
      user = await owner.findOne({
        $or: [
          { "verification.email.address": email },
          { "verification.phone.number": mobileNumber }
        ]
      });
    } else if (type === 'business') {
      user = await business.findOne({
        $or: [
          { "verification.email.address": email },
          { "verification.phone.number": mobileNumber }
        ]
      });
    } else {
      return res.status(400).json({ message: 'Invalid type. Use owner or business.' });
    }
    if(type=="owner"){
      if (!user) {
        // Create new owner if not found
        user = new owner({
          verification: {
            phone: {
              number: mobileNumber,
              isVerified: false  // Mark as not verified initially
            },
          },
        });
      }
    }else{
      if (!user) {
        // Create new owner if not found
        existingOwner = new business({
          verification: {
            phone: {
              number: mobileNumber,
              isVerified: false  // Mark as not verified initially
            },
          },
        });
      }
    }

    await user.save();

    // Send OTP via Twilio Verify API
    await client.verify.v2.services(process.env.SERVICE_SID)
      .verifications
      .create({ to: mobileNumber, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
},

  // Verify OTP for Phone Number
  exports.phoneNumberVerifyOTP = async (req, res) => {
    try {
      const { mobileNumber, otp,type } = req.body;
  
      // Call Twilio's Verify API to check if the OTP is correct
      const verificationCheck = await client.verify.v2.services(process.env.SERVICE_SID)
        .verificationChecks
        .create({ to: mobileNumber, code: otp });


        if (verificationCheck.status === 'approved') {
          // Find the owner in the database and update `isVerified` to true
          if (type === "owner") {
            const update = {
              "verification.phone.number":mobileNumber,  // Optionally reset the number after verification
              "verification.phone.isVerified": true
            };
        
            // Correct the typo in 'verification' and directly pass the object into $set
            await owner.updateOne(
              { "verification.phone.number": mobileNumber },  // Correct query
              { $set: update },  // Apply the updates
              { new: true }
            );
          } else {
            const update = {
              "verification.phone.number":mobileNumber,
              "verification.phone.isVerified": true
            };
        
            // Correct the typo in 'verification' and directly pass the object into $set
            await business.updateOne(
              { "verification.phone.number": mobileNumber },  // Correct query
              { $set: update }  // Apply the updates
            );
          }
        
          res.status(200).json({ message: 'Phone number verified successfully' });
        }
        
  
        else {
        res.status(400).json({ message: 'Invalid OTP' });
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
    }
  };
  