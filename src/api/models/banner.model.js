"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const banner = new Schema({
  position: Number,
  type: String,
  url: String,
  image: {
    type: String
  }
});
module.exports = mongoose.model("banner", banner);