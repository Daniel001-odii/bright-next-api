const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');



// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
   async  (accessToken, refreshToken, profile, done) => {
    // process user detail for db usage...
    try{
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
            user = new User({
              googleId: profile.id,
              username: profile.displayName,
              email: profile.emails[0].value,
              avatar_url: profile.photos[0].value,
              // Add other user properties as needed
            });
            await user.save();
        }
        // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    // Attach the token to the user object for future use
    user.token = token;
    return done(null, user);
    }
    catch (error) {
        return done(error, null);
      }
}));
  
  // Serialize user information into the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  // Deserialize user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  



exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// I DONT KNOW WHY BUT THIS CODE SEEMS NOT TO BE WROKING ....
// exports.googleCallback = passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//     res.status(200).json({ data:req.user })
// }


exports.logout = (req, res) => {
    req.logout(err => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      return res.status(200).json({ message: 'Logged out successfully' });
    });
  };


exports.currentUser = (req, res) => {
  res.json(req.user);
};