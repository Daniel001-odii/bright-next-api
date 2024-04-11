// COURSE CONTROLLER FILE...
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");

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
        // get the course by ID...
        const course = req.params.course_id;
        const user = req.userId;
        const cart = await Cart.findOne({ user });

        // first check if course is already in user's cart...
        // add to cart if false, do nothing if true...
        const course_already_in_cart = cart.courses.includes(course);

        console.log("course already in cart: ", course_already_in_cart)

        if(!course_already_in_cart){
            // add to user's cart.... and ready for checkout
            cart.courses.push(course);

            console.log("user's cart updated with new course: ", cart);

            // save user's cart...
            await cart.save();

            // send response to client...
            return res.status(200).json({ message: "Course added to cart successfully!"});
        }
        
        // Course already in cart, send response to client...
        return res.status(200).json({ message: "Course already in cart!"});
        
    } catch (error) {
        console.log("error enrolling to course: ", error)
        res.status(500).json({ error: error.message });
    }
};


