const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

// authentication routes....

// login user
router.post('/login', authController.signin);

// regsiter user
router.post('/register', authController.signup);

// sendPassResetLink
router.post('/passreset', authController.sendPasswordResetEmail);

// passReset initialize
router.post('/pass/reset', authController.resetPassword);


// AUTH PROVIDER ROUTES >>>

// google auth handler
router.post('/google-auth', authController.handleGoogleAuthLogic);

// facebook auth handler
router.post('/facebook-auth', authController.handleFacebookAuthLogic);




module.exports = router;