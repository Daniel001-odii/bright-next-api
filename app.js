require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
// Enable CORS with specific options
// app.use(cors({
//   origin: 'http://localhost:8081', 
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionSuccessStatus: 200,
// }));


const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const path = require('path');

const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
// app.use(cors());
// const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;


app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));




// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
  extended: true
}));


app.use('/api', userRoutes);
app.use('/api', authRoutes);
app.use('/api', courseRoutes);
app.use('/api', paymentRoutes);


// Connect to the db
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('[****] -- Bright-next Database connected successfully...');
    // You can perform additional operations here after successful connection
  })
  .catch((err) => {
    console.error('Error connecting to database:', err);
    // Handle connection errors here
  });


// Profile route (protected)
app.get('/api/profile', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});





// Start the server
app.listen(process.env.PORT || port, () => {
  console.log(`[****] -- Bright-next Server is running on port http:127.0.0.1:${process.env.PORT}`);
});
