'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const address = new Schema({
  firstName: {
    type: String,
    required: [true, "can't be blank"]
  },
  lastName: {
    type: String,
    required: [true, "can't be blank"]
  },
  province: {
    type: String,
    required: [true, "can't be blank"]
  },
  district: {
    type: String,
    required: [true, "can't be blank"]
  },
  commune: {
    type: String,
    required: [true, "can't be blank"]
  },
  commune: {
    type: String,
    required: [true, "can't be blank"]
  },
  specificAddress: {
    type: String
  },
  phoneNumber: {
    type: String,
    required: [true, "can't be blank"]
  },
  id_user: {
    type: String,
    required: [true, "can't be blank"]
  },
})
module.exports = mongoose.model('address', address);