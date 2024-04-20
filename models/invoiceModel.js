const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Course'
    }],
    payment_method: {
        type: String,
        enum: ["stripe", "paypal"]
    },
    title: String,
    amount: Number,
    // status: {
    //     type: String,
    //     enum: ["paid", "unpaid"],
    //     default: "paid"
    // }
    
  }, { timestamps: true });
  
  const Invoice = mongoose.model('Invoice', InvoiceSchema);
  
  module.exports = Invoice;