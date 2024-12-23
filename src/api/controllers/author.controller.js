'use strict'
const author = require('../models/author.model');

exports.getAuthor = (req, res) => {
  author.find({})
    .then(docs => {
      res.status(200).json({ data: docs })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.message });
    })
}