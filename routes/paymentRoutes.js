const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");


router.post("/payment/stripe", authMiddleware, paymentController.payWithStripe);

router.post("/payment/stripe/guest", paymentController.guestPayWithStripe);



module.exports = router;