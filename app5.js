// Import required modules
const express = require('express');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const session = require('express-session');
const axios = require('axios');
const dotenv = require('dotenv').config();

// Initialize Express app
const app = express();

// Configure session middleware
app.use(session({
  secret: 'your_secret_here',
  resave: true,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Define LinkedIn Strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: 'http://localhost:3002/auth/linkedin/callback',
  scope: ["profile", "email", "openid"],
  state: true
}, async (accessToken, refreshToken, profile, done) => {
  try {

    console.log("accessToken: ", accessToken);
    console.log("callback url", callbackURL)
    // Here you can use the access token to fetch user data from LinkedIn API
    // For example, you can make a request to retrieve user's profile information
    // const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
    //   headers: {
    //     Authorization: `Bearer ${accessToken}`
    //   }
    // });
    
    // const userData = response.data;

    // You can process the userData as per your application's requirement
    // console.log('User data:', userData);

    // Pass user data to the next middleware
    // done(null, userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    done(error);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  // For simplicity, we'll just serialize the entire user object
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // For simplicity, we'll just deserialize the entire user object
  done(null, user);
});

// Define routes
app.get('/auth/linkedin', passport.authenticate('linkedin'));

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/login'
}), (req, res) => {
  // Authentication successful, redirect to the home page or dashboard
  res.redirect('/');
});

// Home route
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // If user is authenticated, display user data
    res.send(`Welcome ${req.user.localizedFirstName} ${req.user.localizedLastName}`);
  } else {
    // If user is not authenticated, redirect to login page
    res.redirect('/login');
  }
});

// Login route
app.get('/login', (req, res) => {
  res.send('Please login with LinkedIn <a href="/auth/linkedin">Login</a>');
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
