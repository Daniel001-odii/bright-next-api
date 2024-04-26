// write the controllers for all possible actions in storre...

const User = require("../models/userModel");
const Course = require("../models/courseModel");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'danielsinterest@gmail.com',
    pass: 'qdjctvwagyujlqyg',
  },
});


  // controller function to update user data...
exports.getUserDetailsFromToken = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

  // Controller function to get user by ID
exports.getUserById = async (req, res) => {
    try {
      const { userId } = req.params.user_id; // Assuming the user ID is passed as a route parameter

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'user not found' });
      }

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to get user by ID' });
    }
};

exports.findUserByUsername = async (req, res) => {
    const { username } = req.params; // Assuming the username is available in the request parameters

    try {
      // Find the user by username
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

exports.updateUserSettings = async (req, res) => {
    try {
       // Get the JWT token from the request headers
       const token = req.headers.authorization.split(' ')[1];

       if (!token) {
         return res.status(401).json({ message: 'Token not provided' });
       }

       // Verify and decode the token
       const decoded = jwt.verify(token, process.env.API_SECRET);

       // Extract user ID from the decoded token payload
       const userId = decoded.userId;

        // Fetch user details from the database using the extracted userId
       const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Update user settings based on the request body
      if (req.body.notificationSettings) {
        user.notificationSettings = req.body.notificationSettings;
      }

      if (req.body.subscriptionSettings) {
        user.subscriptionSettings = req.body.subscriptionSettings;
      }

      if (req.body.privacySettings) {
        user.privacySettings = req.body.privacySettings;
      }

      if (req.body.themeSettings) {
        user.themeSettings = req.body.themeSettings;
      }

      // Save the updated user details to the database
      await user.save();

      return res.status(200).json({ success: true, message: 'User settings updated successfully', user });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to update user settings' });
    }
  };

exports.adjustUserData = async (req, res) => {
    const userId = req.params.userId; // Assuming userId is available in the request params
    const updatedUserData = req.body; // Assuming updated user data is sent in the request body

    try {
      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update user data with the new information
      Object.assign(user, updatedUserData);

      // Save the updated user data to the database
      const updatedUser = await user.save();

      return res.status(200).json({ message: 'User data updated', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

// users who has signed up via checkout page...
// SEND EMAIL HERE FOR PASSWORD RESET
exports.createGuestUserAccount = async (req, res) => {
  console.log("user from client == ", req.body.user);

 
  try{
    if(req.body.user == null){ return res.status(200).json({ message: "no user data provided"}) }
    else {
      const { password_reset_token, email, firstname, lastname, password, courses_purchased } = req.body.user;
      const existingUser = await User.findOne({ email });
      
      // reset link is only active for 1 hour after bieng sent..
      const password_reset_expiry = Date.now() + 3600000;
  
      if (existingUser) {
        return res.status(201).json({ message: 'Sorry, this email is already registered' });
      } else {
        const newUser = new User({
          email,
          firstname,
          lastname,
          password_reset_token,
          password_reset_expiry,
          enrolled_courses: courses_purchased,
        });

        await newUser.save();
        console.log("user account created: ", newUser);

        // SEND PASSWORD RESET LINK HERE...
        const mailOptions = {
          from: 'danielsinterest@gmail.com',
          to: email,
          subject: 'Bright Next Order Success Confirmation and Password Reset',
          html: `<p>this email is a confirmation of your course purchase from bright-next academy.<br/>Find below a link to reset your password and continue enjoying the platform (link expires in 1hr</p>
                <p><a href="${process.env.GOOGLE_REDIRECT_URI}/thankyou/${password_reset_token}">Click here</a> to quickly reset your password and Sign-in!</p>`
        };

  
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send reset email' });
          }
  
          console.log('confirmation and pass reset email sent:', info.response);
          res.status(200).json({ message: 'confirmation and pass reset email sent' });
        });


        res.status(200).json({ message: 'User Registered Successfully', user: newUser });
      }
    }

    
  }catch(error){
    console.log("error creating user: ", error);
    res.status(500).json({ message: "internal server error"});
  }
};

// set password controller for guest user safter checkout..
exports.setPassword = async (req, res) => {
  const { password, reset_token } = req.body;

  console.log("reset_token from client: ", req.body.reset_token);

  try {
      // Find the user by the reset token and ensure it's not expired
      const user = await User.findOne({ password_reset_token: reset_token, password_reset_expiry: { $gt: Date.now() }, });

      console.log("searched user: ", user)

      if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 8);

      // Update the user's password and clear the reset token fields
      user.password = hashedPassword;
      user.password_reset_token = undefined;
      user.password_reset_expiry = undefined;
      await user.save();

      // send login token...
      // Generate JWT token for authentication
      const token = jwt.sign({ userId: user._id }, process.env.API_SECRET, { expiresIn: '1d' });
      res.status(200).json({ message: 'Password reset successful, please login', token: token });
  } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};


// check is reset token is still valid...
exports.checkResetToken = async (req, res) => {
  try{
    const reset_token = req.params.reset_token;

    if(reset_token){
      console.log("token from client: ", reset_token);

      const user = await User.findOne({ password_reset_token: reset_token, password_reset_expiry: { $gt: Date.now() } });

      // check if reset token provided by user is still valid..
      if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
      } else {
      return res.status(200).json({ message: 'reset token active', email: user.email });
      }
    } else {
        return res.status(400).json({ message: 'no token provided' });
    }

  }catch(error){
    console.error('Error checking token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// find user by email addresss...
exports.findUserByEmailAddress = async (req, res) => {
  const email = req.params.email;

  try{
    const user = await User.findOne({ email });

    if(user){
      res.status(400).json({ message: "There is already an account with this email address."})
    } else {
      res.status(200).json({ message: "user not found"})
    }

  }catch(error){
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


// get user enrolled courses in detailss...
exports.getUserEnrolledCourses = async (req, res) => {
  try{
    const user = await User.findOne({ _id: req.userId }).populate("enrolled_courses");
    const enrolled_courses = user.enrolled_courses;

    res.status(200).json({ enrolled_courses });

  }catch(error){
    console.error('Error retrieving user enrolled courses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}