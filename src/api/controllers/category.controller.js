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