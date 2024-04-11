const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Course'
        }
    ],
  }, { timestamps: true });
  
  const Cart = mongoose.model('Cart', CartSchema);
  
  module.exports = Cart;
  
  