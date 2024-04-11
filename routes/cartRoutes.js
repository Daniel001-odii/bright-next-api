const express = require('express');
const router = express.Router();
const cartController = require("../controllers/cartController");

const authMiddleware = require('../middlewares/authMiddleware');


// get user's cart data...
router.get('/cart', authMiddleware, cartController.getUserCart);

// remove a course from the user's cart...
router.post('/cart/courses/:course_id/remove', authMiddleware, cartController.removeCourseFromCart);

module.exports = router;
