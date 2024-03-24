const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
const APP_URL = process.env.GOOGLE_REDIRECT_URI;


exports.payWithStripe = async (req, res) => {
    try{
        const PRODUCT_FROM_CLIENT = req.body;

        const stripe_product = await stripe.products.create({
            name: PRODUCT_FROM_CLIENT.name,
        });

        const stripe_price = await stripe.prices.create({
            product: stripe_product.id,
            unit_amount: PRODUCT_FROM_CLIENT.amount,
            currency: 'usd',
        });

        console.log("got a product: ", stripe_product);
        console.log("added price for product ", stripe_price);

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price: stripe_price.id,
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${APP_URL}/bn/thankyou`,
            cancel_url: `${APP_URL}/bn/dashboard`,
        });

        res.status(200).json({ session_url: session.url })


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
        const PRODUCT_FROM_CLIENT = req.body;

        const stripe_product = await stripe.products.create({
            name: PRODUCT_FROM_CLIENT.name,
        });

        const stripe_price = await stripe.prices.create({
            product: stripe_product.id,
            unit_amount: PRODUCT_FROM_CLIENT.amount,
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