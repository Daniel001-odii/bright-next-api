// COURSE CONTROLLER FILE...
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Invoice = require("../models/invoiceModel");


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

// user enroll course [literally adds course to user's cart]...
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


exports.getCoursesByArray = async (req, res) => {
    try {
        const { courses_array } = req.body;

        console.log("array from client: ", courses_array);

        let courses = [];

        for(let i = 0; i < courses_array.length; i++){
            const course = await Course.findOne({ _id: courses_array[i] });
            if (course) {
                courses.push(course);
            } else {
                // Handle case where course is not found
                res.status(200).json({ message: `course: ${course} not found`})
            }
        }

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("error getting course array: ", error)
    }
};



/* 
this controller does the main checkout action 
by adding the course or courses 
into the user's enrolled courses array
*/
exports.checkoutCoursesAndCreateInvoice = async (req, res) => {
    try{
        const { courses_array, payment_method, total_amount } = req.body;
        const user_id = req.userId;
        const user = await User.findOne({ _id: user_id });
        const cart = await Cart.findOne({ user: user_id });

        // empty the user's cart after successful checkout...
        cart.courses = [];
        await cart.save()

        // create invoice for course or courses purchased...
        let courses = [];
        let multiple_course_title = [];

        const missingCourses = [];

        for(let i = 0; i < courses_array.length; i++){
            const course = await Course.findOne({ _id: courses_array[i] });
            if (course) {
                courses.push(course);
                multiple_course_title.push(course.title);
            } else {
                // Collect missing courses
                missingCourses.push(courses_array[i]);
            }
        }

        // Check if any courses were missing
        if (missingCourses.length > 0) {
            return res.status(404).json({ message: `Courses not found: ${missingCourses.join(", ")}` });
        }


        // create new invoice for course purchase...
        const invoice = new Invoice({
            user: user_id,
            courses: courses_array,
            payment_method,
            title: `invoice for ${multiple_course_title.join(" & ")} course purchase`,
            amount: total_amount
        });

        // save course to user's enorlled courses...
        user.enrolled_courses.push(...courses);
        await user.save();

        await invoice.save();

        res.status(200).json({ message: "Course Enrollment and Cart Checkout Succesfull"})

    }catch(error){
        console.log("error enrolling courses: ", error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
