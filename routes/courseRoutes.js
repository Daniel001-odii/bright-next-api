const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Routes for course CRUD operations
router.get('/courses', courseController.getAllCourses);
router.post('/courses', courseController.createCourse);
router.get('/courses/:title', courseController.getCourseByTitle);
router.patch('/courses/:title', courseController.editCourseByTitle);
router.delete('/courses/:title', courseController.deleteCourseByTitle);

// Additional routes

router.post('/courses/:courseId/enroll', courseController.enrollCourse);

module.exports = router;
