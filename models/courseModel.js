const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    duration: String,
    modules: Number,
    start_date: {
        type: Date,
        default: Date.now()
    },
    image: String,
  }, { timestamps: true });
  
  const Course = mongoose.model('Course', CourseSchema);
  
  module.exports = Course;
  
  