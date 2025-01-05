"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bill = new Schema({
  id_user: {
    type: String,
    required: [true, "can't be blank"],
    index: true
  },
  date_create: {
    type: Date
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
    minlength: 1
  },
  total: Number,
  subtotal: Number,
  discount: Number,
  payment_method: String,
  address: String,
  phone: String,
  status: String,
  name: String
});
module.exports = mongoose.model("bill", bill);
