'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart = new Schema({
  id_user: {
    type: String,
  },
  date: {
    type: Date,
    default: new Date()
  },
  products: {
    type: [
      {
        id_category: String,
        name: String,
        price: Number,
        release_date: Date,
        img: Array,
        describe: String,
        id_publisher: String,
        id_author: String,
        count: Number,
        sales: Number,
        available: Boolean,
        _id: String,
      }
    ],
    required: true,
    minlength: 1,
  },
})

module.exports = mongoose.model('cart', cart);