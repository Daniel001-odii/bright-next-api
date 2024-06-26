/*

The authentication and authorization method that has been used for this API
is only a single JWT Token which is saved in the client's Local Storage in the 
Vue App.... this is obviously not suitable for use in a production environment,
instead a stronger security measure should be taken like the use of 
an access_token and a refresh_token and then stored in a httpOnly cookie for
a more stronger security.

*/


const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Import the User model

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.API_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired. Please log in again' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      // If user is not found by userId, try finding by googleId
      const userByGoogleId = await User.findOne({ googleId: decoded.googleId });
    
      if (!userByGoogleId) {
        // If user is not found by googleId as well, return an error
        return res.status(401).json({ message: 'Invalid token. User not found' });
      }
      
      req.userGoogleId = userByGoogleId.googleId;
      req.userId = userByGoogleId._id;
      req.user = userByGoogleId;
      console.log(req.user)
    } else {
      // If user is found by userId, set the properties accordingly
      
      req.userGoogleId = user.googleId;
      req.userId = user._id;
      req.user = user;
      console.log(req.user)
    }
    
    next();
  } catch (error) {
    console.error('Error in authentication middleware:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authenticateUser;
