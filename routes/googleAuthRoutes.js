const express = require('express');
const passport = require('passport');
const router = express.Router();
const googleAuthController = require("../controllers/googleAuthController");


// Google Auth
// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'] })
// );

router.get('/google', googleAuthController.googleLogin);

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.status(200).json({ token: req.user.token, user:req.user })
});

router.get('/google/logout', googleAuthController.logout);

router.get('/google/current-user', googleAuthController.currentUser);

module.exports = router;
