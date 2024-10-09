const { createToken } = require('../../jwt');
const owner = require('../dbModels/ownerModel');
const { validateOwner } = require('../helpers/validation.js');


module.exports = {
  register: [
    async (req, res) => {
      try {
        // Validate the request body
        const { error, value } = validateOwner(req.body);
        if (error) return res.status(400).json({ message: 'Validation failed', details: error.details });

        // Check if the owner is already registered
        const existingOwner = await owner.findOne({ 
          'verification.email.address': req.body.email,
          'verification.email.isVerified': true,
          'verification.phone.number':req.body.mobileNumber,
          'verification.phone.isVerified':true
        });
        
        if (!existingOwner) {
          return res.status(402).json({ message: "Please verify your email or mobileNumber." });
        }
        

        // Ensure the profile picture is uploaded
        if (!req.file) return res.status(400).json({ message: 'Profile picture is required' });


        // Create the new owner
        const updateOwner = {
          profilePicture: req.file.path,  // Multer stores the file path in `req.file.path`
          ...req.body  // Spread the rest of the form data (name, country, etc.)
        };
        
        // Update query to match the owner's email address inside nested structure
        await owner.updateOne(
          { 'verification.email.address': req.body.email },  // Use dot notation to match email in nested object
          { $set: updateOwner } , // Use `$set` to update the owner with new data
          {new:true}
        );
        
        // Generate JWT token
        const token = createToken(updateOwner);

        // Respond with success
        return res.status(201).json({
          message: 'Owner registered successfully',
          data: updateOwner,
          token,
        });
      } catch (error) {
        console.error(error);  // Log the error for debugging
        return res.status(500).json({ message: 'Internal server error', error: error.message });
      }
    },
  ],
};
