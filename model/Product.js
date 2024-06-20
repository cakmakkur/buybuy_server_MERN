const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
  id: String,
  name: String,
  img_path: [String],
  category: String,
  tn_description: String,
  brand: String,
  color: String,
  priceCents: String,
  prevPriceCents: { 
    type: String, default: null 
  },
  shippingCostCents: String,
  inStock: {
    type: Boolean, default: true
  },
  reviews: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Review', 
    default: [] 
  }]
})

module.exports = mongoose.model('Product', productSchema)