'use strict'
const publisher = require('../models/publisher.model');
exports.getPublisher = (req, res) => {
  publisher.find({})
    .then(docs => {
      res.status(200).json({ data: docs });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
}