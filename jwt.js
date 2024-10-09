const jwt = require('jsonwebtoken');

// JWT secret key (store this in environment variables in a real app)
const JWT_SECRET = 'your_jwt_secret';


// Function to generate a JWT token
const createToken = (user) => {
  console.log(user)
  return jwt.sign(

    { id:user._id,email: user.verification.email.address,mobileNumber:user.verification .phone.number},
    JWT_SECRET,
    { expiresIn: '1h' } // Token expires in 1 hour
  );
};

// Function to verify a JWT token
const verifyToken = (req, res, next) => {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Token is not valid' });
      }
  
      // Store the decoded token data (such as user ID, role) in request object
      req.user = decoded;
  
      // Proceed to the next middleware/controller
      next();
    });
  };



  

module.exports = {  createToken, verifyToken}