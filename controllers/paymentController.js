const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
const APP_URL = process.env.GOOGLE_REDIRECT_URI;
const Invoice = require("../models/invoiceModel");
const User = require("../models/userModel")

const nodemailer = require('nodemailer')


exports.payWithStripe = async (req, res) => {
    try{
        /*
        *course_purchase: {
            name: <MAY BE COMBINED NAME OF COURSES>
            amount: < MAY BE COMBINED AMOUNT>
            courses: < AN ARRAY OF THE PURCHASED COURSE ID's >
        }
        */
    //    const user = req.user
        const course_purchase = req.body;

        const stripe_product = await stripe.products.create({
            name: course_purchase.name,
        });

        const stripe_price = await stripe.prices.create({
            product: stripe_product.id,
            unit_amount: course_purchase.amount,
            currency: 'usd',
        });

        // I REMOVED CONSOLE DOT LOG FROM HERE....


        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: stripe_price.id,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${APP_URL}/bn/thankyou`,
            cancel_url: `${APP_URL}/bn/dashboard`,
        });

        res.status(200).json({ session_url: session.url });

        // CREATE INVOICE FOR EACH PURCHASE HERE...
        const invoice = new Invoice({
            user: req.userId,
            title: course_purchase.name,
            payment_method: "stripe",
            amount: course_purchase.amount,
            courses: course_purchase.courses
        })
        console.log("created invoice for user: ", req.user.email)
        await invoice.save();



    }catch(error){
        res.status(500).json({ message: "error paying with stripe" });
        console.log("error paying with stripe: ", error)
    }
}


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

exports.guestPayWithStripe = async (req, res) => {
    try{
        const course_purchase = req.body;
        const stripe_product = await stripe.products.create({
            name: course_purchase.name,
        });

        const stripe_price = await stripe.prices.create({
            product: stripe_product.id,
            unit_amount: course_purchase.amount,
            currency: 'usd',
        });

        console.log("got a product: ", stripe_product);

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: stripe_price.id,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${APP_URL}/thankyou`,
            cancel_url: `${APP_URL}`,
        });

        

        res.status(200).json({ session_url: session.url });

        // create a new user using details from public checkout..
        // what if user has an account and uses public checkout?
        // check if the email is already existing if not then create a new user account...

        const existingUser = await User.findOne({ email: course_purchase.user.email });
        if(existingUser){console.log("user alreay exists")};
        if(!existingUser){
            try{
                const user = new User({
                    firstname: course_purchase.user.firstname,
                    lastname: course_purchase.user.lastname,
                    email: course_purchase.user.email
                });
                console.log("new user accoount created!");
    
                const resetToken = Math.floor(100000 + Math.random() * 900000);
                const resetTokenExpiration = Date.now() + 3600000; // 1 hour
                user.password_reset_token = resetToken;
                user.password_reset_expiry = resetTokenExpiration;
                await user.save();

                // CREATE INVOICE FOR USER HERE...
                const invoice = new Invoice({
                    user: req._id,
                    title: course_purchase.name,
                    payment_method: "stripe",
                    amount: course_purchase.amount,
                    courses: course_purchase.courses
                })
                await invoice.save();

                  // Send an email to the user with a link containing the reset token
                const mailOptions = {
                  from: 'danielsinterest@gmail.com',
                  to: course_purchase.user.email,
                  subject: 'Bright Next Academy Password Set Request',
                  html: `<p>You are receiving this email because you (or someone else) have requested the reset of your account password.</p>
                        <p>Please click <a href="${process.env.GOOGLE_REDIRECT_URI}/user/${resetToken}/password"> this link</a> to reset your password</p>`,
                };
              
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error('Error sending email:', error);
                      return res.status(500).json({ message: 'Failed to send reset email' });
                    }
              
                    console.log('Reset email sent:', info.response);
                    res.status(200).json({ message: 'Password reset email sent' });
                });
            }catch(error){
                console.log("error creating new user: ", error)
            }
            
        }

    }catch(error){
        res.status(500).json({ message: "error paying with stripe" });
        console.log("error paying with stripe: ", error)
    }
}