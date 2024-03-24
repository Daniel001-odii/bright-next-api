const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
const APP_URL = process.env.GOOGLE_REDIRECT_URI;
const Invoice = require("../models/invoiceModel");


exports.payWithStripe = async (req, res) => {
    try{
        /*
        *course_purchase: {
            name: <MAY BE COMBINED NAME OF COURSES>
            amount: < MAY BE COMBINED AMOUNT>
            courses: < AN ARRAY OF THE PURCHASED COURSE ID's >
        }
        */
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
            success_url: `${APP_URL}/bn/thankyou`,
            cancel_url: `${APP_URL}`,
        });

        res.status(200).json({ session_url: session.url })


    }catch(error){
        res.status(500).json({ message: "error paying with stripe" });
        console.log("error paying with stripe: ", error)
    }
}