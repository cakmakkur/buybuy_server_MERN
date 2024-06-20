const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  productId: String,
  productName: String,
  productThumbnail: String,
  quantity: Number,
  currentUnitPrice: Number,
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
});

module.exports = orderSchema