const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: { 
        type: String,
        unique: true,
    },
    description: String,
    duration: String,
    modules: Number,
    start_date: Date,
    image: String,

    // instructor: {
    //     type: mongoose.Schema.Types.ObjectId, ref: 'User'
    // },

  }, { timestamps: true });
  
  const Course = mongoose.model('Course', CourseSchema);
  
  module.exports = Course;