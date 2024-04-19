const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const APP_URL = process.env.GOOGLE_REDIRECT_URI;
const Invoice = require("../models/invoiceModel");
const User = require("../models/userModel")

const nodemailer = require('nodemailer')

const paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'danielsinterest@gmail.com',
    pass: 'qdjctvwagyujlqyg',
  },
});


// STRIPE CONFIGURATION...

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
  PAYPAL CPAYMENT CONTROLLER
**
*/

exports.initiatePaypalPayment = (req, res) => {

  // CREATE PAYMENT CONFIGURATION JSON
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              res.redirect(payment.links[i].href);
            }
          }
      }
    });
    
};

  // PAYMENT SUCCESS ROUTE
exports.handlePaypalSuccess = (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
};

// HANDLE CANCEL...
exports.handlePaypalCancel = (req, res) => {
  // Cancel callback logic
  res.send('Cancelled')
};




