const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const orderSchema = require('../model/Order')

const userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ""
  },
  familyName: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  roles: {
    User: {
      type: Number,
      default: 2000
    },
    Admin: Number
  },
  refreshToken: String,
  orders: [orderSchema]
})

module.exports = mongoose.model('User', userSchema)