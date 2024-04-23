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

      // the amount has been used for testing 
      // please use the amount provided from the body...
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

  const { product } = req.body;

  console.log("product submitted by client: ", req.body)

  /* 
  product object

  const product = {
    name: <can be multiple names concatenated>,
    price: <Number
  }
  */

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
                "name": "Course Enrollment",
                "sku": "001",
                "price": `${product.price}.00`,
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": `${product.price}.00`
        },
        "description": "Bright Next Course Enrollment"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
          throw error;
      } else {
          for(let i = 0;i < payment.links.length;i++){
            if(payment.links[i].rel === 'approval_url'){
              // res.redirect(payment.links[i].href);
              res.status(200).json({ links: payment.links[i].href })
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




