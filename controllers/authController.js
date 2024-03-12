const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Import the User model
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// GOOGLE STUFFS.....
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(
  {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  }
)

// Call this function to validate OAuth2 authorization code sent from client-side
async function verifyCode(code) {
  let { tokens } = await client.getToken(code)
  client.setCredentials({ access_token: tokens.access_token })
  const userinfo = await client.request({
    url: 'https://www.googleapis.com/oauth2/v3/userinfo'
  })
  return userinfo.data
}


// HANDLE USER LOGIN WITH GOOGLE...
exports.handleGoogleAuthLogic = async (req, res) => {
  try{
    const authCodeFromClient = req.body;
    try{
    
      const user_info = await verifyCode(authCodeFromClient.code);
      // check is user is already exisiting using email and update and sign in if not
      // create  a new user account and sign user in...
      const existingUser = await User.findOne({ googleId: user_info.sub });
      if(existingUser){
        // Generate JWT token for authentication
        const token = jwt.sign({ googleId: user_info.sub }, process.env.API_SECRET, { expiresIn: '1d' });
        // Respond with the token and user information
        res.status(200).json({
          message: 'user login successful',
          token
        });
      }
          // IF GOOGLE USER NOT EXISTING......
      else{
        const newUser = new User({
          googleId: user_info.sub,
          email: user_info.email,
          firstname: user_info.family_name,
          lastname: user_info.given_name,
          provider: "google",
          avatar_url: user_info.picture,
        });
        await newUser.save();

        // Generate JWT token for authentication
        const token = jwt.sign({ googleId: user_info.sub }, process.env.API_SECRET, { expiresIn: '1d' });


        res.status(200).json({
          message: "user registered successfully",
          token
        });
      }
      
    }catch(error){
      console.log("error from handle google auth logic", error)
    }
  
  }catch(error){
    console.log("first google auth error: ", error)
  }
 
}



// Handle user signup
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists in the database
    const existingUser = await User.findOne({ $or: [{ email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Sorry, this email is already registered' });
    } 
    else{
    // Create a new user based on the User model
    const newUser = new User({
      username,
      email,
      password: bcrypt.hashSync(password, 8),
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ message: 'User Registered Successfully', user: newUser });
  }
  } catch (error) {
    console.error(error); // Log the error to the console for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Handle user sign-in
exports.signin = async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  try {
    // Check if the username or email exists in the database
    const user = await User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username/email or password' });
    }

    // Generate JWT token for authentication
    const token = jwt.sign({ userId: user._id }, process.env.API_SECRET, { expiresIn: 86400 });

    // Respond with the token and user information
    res.status(200).json({
      message: 'Sign-in successful',
      token,
      user: {
        _id: user._id,
        username: `${user.firstname} - ${user.lastname}`,
        email: user.email,
        // ...other user fields you may want to include
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// handle sending password reset links to users
exports.sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
      // Find the user by their email address
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate a unique reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Set an expiration time for the reset token (e.g., 1 hour)
      const resetTokenExpiration = Date.now() + 3600000; // 1 hour

      // Update the user's document with the reset token and expiration time
      user.resetToken = resetToken;
      user.resetTokenExpiration = resetTokenExpiration;

      await user.save();

      // Send an email to the user with a link containing the reset token
      const transporter = nodemailer.createTransport({
        service: 'gmail', // e.g., Gmail
        auth: {
          user: 'danielsinterest@gmail.com',
          pass: 'qksdojcrljuxzaso',
        },
      });

      const mailOptions = {
        from: 'danielsinterest@gmail.com',
        to: email,
        subject: 'Password Reset Request',
        html: `<p>You are receiving this email because you (or someone else) have requested the reset of your account password.</p>
              <p>Please use the following token to reset your password: <strong>${resetToken}</strong></p>
              <p>This token will expire after 1 hour.</p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
          return res.status(500).json({ message: 'Failed to send reset email' });
        }

        console.log('Reset email sent:', info.response);
        res.status(200).json({ message: 'Password reset email sent' });
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

// handle reset password request by users...
exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    try {
      // Find the user by the reset token and ensure the token is not expired
      const user = await User.findOne({
        resetToken,
        resetTokenExpiration: { $gt: Date.now() }, // Check if the token is not expired
      });

      if (!user) {
        return res.status(404).json({ message: 'Invalid or expired reset token' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token fields
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;

      await user.save();

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};