const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware');


// Routes for course CRUD operations
// get courses by a an array of curse IDs...
router.post('/courses/array', courseController.getCoursesByArray);

router.get('/courses', courseController.getAllCourses);


router.post('/courses', courseController.createCourse);
router.get('/courses/:title', courseController.getCourseByTitle);
router.patch('/courses/:title', courseController.editCourseByTitle);
router.delete('/courses/:title', courseController.deleteCourseByTitle);

// route to enroll course...
router.post('/courses/:course_id/enroll', authMiddleware, courseController.enrollCourse);

// route to checkout courses and create invoice...
router.post("/courses/enroll", authMiddleware, courseController.checkoutCoursesAndCreateInvoice);



module.exports = router;
