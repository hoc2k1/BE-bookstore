"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = new Schema({
  email: {
    type: String,
    required: [true, "can't be blank"],
    index: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, "is invalid"],
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "can't be blank"],
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
});
module.exports = mongoose.model("user", user);
