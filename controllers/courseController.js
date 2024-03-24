// COURSE CONTROLLER FILE...
const Course = require("../models/courseModel");
/**
 * 
 * CREATE
 * READ
 * UPDATE
 * DELETE
 * 
 */

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { title, description, duration, modules, start_date, image } = req.body;
        const course = new Course({
            title,
            description,
            duration,
            modules,
            start_date,
            image
        });
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCourseByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const course = await Course.findOne({ title });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.editCourseByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const updatedCourse = await Course.findOneAndUpdate(
            { title },
            { $set: req.body },
            { new: true }
        );
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.deleteCourseByTitle = async (req, res) => {
    try {
        const { title } = req.params;
        const deletedCourse = await Course.findOneAndDelete({ title });
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.enrollCourse = async (req, res) => {
    try {
        // Logic to enroll a user in a course
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

