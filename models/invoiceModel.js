const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    purchase: String,

  }, { timestamps: true });
  
  const Invoice = mongoose.model('Invoice', InvoiceSchema);
  
  module.exports = Invoice;