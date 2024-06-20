const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  stars: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('Review', reviewSchema)