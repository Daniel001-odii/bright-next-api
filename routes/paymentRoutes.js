const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");


// router.post("/payment/stripe", authMiddleware, paymentController.payWithStripe);

// router.post("/payment/stripe/guest", paymentController.guestPayWithStripe);

// router.post("/payment/create-checkout-session", paymentController.createPaymentSession);


router.get("/payment/config", paymentController.paymentsConfig);

router.post("/payment/create-payment-intent", paymentController.createPaymentIntent);

module.exports = router;