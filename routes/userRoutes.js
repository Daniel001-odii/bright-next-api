const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

// Route for creating an activity, using authMiddleware before invoking the controller function
router.get('/get-user', authMiddleware, userController.getUserDetailsFromToken);

// Route for creating an activity, using authMiddleware before invoking the controller function
router.get('/get-user/:user_id', authMiddleware, userController.getUserDetailsFromToken);

// get a specific user by their username/....
router.get('/get-username/:username', userController.findUserByUsername);

// Route for updating user data....
router.put('/set-user/:userId', authMiddleware, userController.adjustUserData);

// ROute for updating user settings ....
router.put('/user-settings', authMiddleware, userController.updateUserSettings);

router.post('/users/guest', userController.createGuestUserAccount);


router.post('/users/guest/security', userController.setPassword);

router.post('/users/guest/:reset_token', userController.checkResetToken);


module.exports = router;