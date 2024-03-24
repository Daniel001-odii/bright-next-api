const express = require('express');
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");


router.post("/payment/stripe", paymentController.payWithStripe);



module.exports = router;