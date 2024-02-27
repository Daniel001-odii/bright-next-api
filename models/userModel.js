const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
      type: String,
      maxlength: [100, 'Username cannot exceed 50 characters'],
      // Set the field to lowercase using the set function
      set: (value) => value.toLowerCase()
    },
    email: {
      type: String,
      // required: true,
      unique: true
    },
    firstname: { type: String, set: (value) => value.toLowerCase()},
    lastname: { type: String, set: (value) => value.toLowerCase()},
    password: {
      type: String,
    },
    googleId: { type: String},
    provider: { type: String, enum: ["native", "google"], default: "native"},
    role: {
      type: String,
      enum: ['admin', 'manager'], // Example roles; adjust as needed
      default: 'admin'
    },
    contact: String,
    country: String,
    state: String,
    city: String,
    subscription: {
      type: String,
      enum: ["basic", "business", "enterprise"],
      default: "basic"
    },
    // date_joined: { type: Date, default: Date.now },
    last_login: Date,
    avatar_url: {type: String, default: 'https://icon-library.com/images/no-profile-pic-icon/no-profile-pic-icon-11.jpg'},
    bio: String,
    verfication:{
      is_verified: {
        type: Boolean,
        default: false
      },
      verification_date: {
        type: Date,
        default: null  // The date of verification, null if not verified yet
      },
    },
  }, { timestamps: true });
  
  const User = mongoose.model('User', userSchema);
  
  module.exports = User;
  
  