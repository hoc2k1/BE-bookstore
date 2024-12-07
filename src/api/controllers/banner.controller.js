'use strict'
const banner = require('../models/banner.model');
exports.getAll = (req, res) => {
  banner.find({})
    .then(docs => {
      res.status(200).json({ data: docs });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
}
exports.addBanner = async (req, res) => {
  if ( typeof req.body.image === "undefined" ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const { position, type, url, image } = req.body;
  const new_banner = new banner({
    position: position,
    type: type,
    url: url,
    image: image
  });
  try {
    new_banner.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    console.log("save banner fail");
    return;
  }
  res.status(201).json({ msg: "success" });
}