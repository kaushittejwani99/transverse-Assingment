const Joi = require('joi');
const business = require('../dbModels/businessModel');  // Assuming you have a Mongoose business model
const{createToken}=require("../../jwt");

exports.registerBusiness = async (req, res) => {
  try {
    // Define the validation schema using Joi, matching the fields in the Mongoose schema
    const businessSchema = Joi.object({
      businessName: Joi.string().min(3).max(50).required(),
      country: Joi.string().required(),
      state: Joi.string().required(),
      city: Joi.string().required(),
      address: Joi.string().required(),
      openingTime: Joi.string().required(),    // e.g., "09:00 AM"
      closingTime: Joi.string().required(),    // e.g., "06:00 PM"
      email: Joi.string().required(),  // Email validation
      mobileNumber: Joi.string().required()    // Assuming phone number validation is done elsewhere
    });

    // Validate the incoming request data
    const { error } = businessSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map(detail => detail.message)
      });
    }

 const {email,mobileNumber}=req.body;
    // Check if business is already verified
    const verification = await business.findOne({
      "verification.email.address": email,
      "verification.email.isVerified": true,
      "verification.phone.number": mobileNumber,
      "verification.phone.isVerified": true
    });

    if (!verification) {
      return res.status(400).json({
        message: "Please verify your email and phone number first."
      });
    }

    // Prepare new business data, including the uploaded image
    const newBusinessData = {
      uploadImage: req.file ? req.file.path : null,  // Multer adds `file` to the request
      ...req.body
    };

    // Update or insert the business details in the database
    const updatedBusiness = await business.findOneAndUpdate(
      { 'verification.email.address': email },
      { $set: newBusinessData },
      { new: true }  // To return the updated document
    );


    // If the business isn't found (for some reason), return an error
    if (!updatedBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Generate a token (assuming you have a function to generate tokens)
    const token = createToken(updatedBusiness); // Add your JWT token generation logic

    // Return response with token and new business data
    res.status(201).json({
      message: "Business registered successfully",
      data: updatedBusiness,
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
    console.log(error)
  }
};

exports.getBusinessDetails = async (req, res) => {
  try {
    // The decoded token payload is stored in req.user (set by the authMiddleware)

    const payload = req.user;

    // Return the decoded payload as the business details
    res.status(200).json({
      message: "Business details fetched successfully",
      data: payload  // Send the decoded token payload
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
