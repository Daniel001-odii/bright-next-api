const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const APP_URL = process.env.GOOGLE_REDIRECT_URI;
const Invoice = require("../models/invoiceModel");
const User = require("../models/userModel")

const nodemailer = require('nodemailer')



// send necessary configuration data to client...
exports.paymentsConfig = async(req, res) => {
    res.send({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      });
}

// initiate a payment intent based on request from client...
  exports.createPaymentIntent = async (req, res) => {
    try {
        // const { amount } = req.body;
        const amount = 50000;
    
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: 'usd',
        });
        console.log("payment intent created: ", paymentIntent);

        res.status(200).json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: {message: error.message} });
      }
  };


/*
**
GUEST USER PAYMENTS
**
*/


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'danielsinterest@gmail.com',
      pass: 'qdjctvwagyujlqyg',
    },
});

