'use strict'
const category = require('../models/category.model');
exports.getCategory = (req, res) => {
  category.find({})
    .then(docs => {
      res.status(200).json({ data: docs });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
}
exports.addCategory = (req, res) => {
  if ( typeof req.body.name === "undefined" ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const { name, image } = req.body;
  const new_category = new category({
    name: name,
    image: image
  });
  try {
    new_category.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    console.log("save category fail");
    return;
  }
  res.status(201).json({ msg: "success" });
}
exports.getNameByID = async (req, res) => {
  if (req.params.id === 'undefined') {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let result
  try {
    result = await category.findById(req.params.id);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
    return;
  }
  if (result === null) {
    res.status(404).json({ msg: "not found" })
    return;
  }
  res.status(200).json({ name: result.name })
}