'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const category = new Schema({
  name: {
    type: String,
    required: [true, "can't be blank"],
  },
  image: String
});
module.exports = mongoose.model('category', category);