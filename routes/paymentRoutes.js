const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

// STRIPE ROUTES...
router.get("/payment/config", paymentController.paymentsConfig);

router.post("/payment/create-payment-intent", paymentController.createPaymentIntent);

router.post("/payment/create-payment-intent", paymentController.createPaymentIntent);


// PAYPAL ROUTES...
router.post("/payment/paypal", paymentController.initiatePaypalPayment);

router.get("/payment/paypal/success", paymentController.handlePaypalSuccess);

router.get("/payment/paypal/cancel", paymentController.handlePaypalCancel);


module.exports = router;