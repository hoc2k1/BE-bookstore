'use strict'
const jwt = require('jsonwebtoken');
const secret_key="mot_store"

exports.verify = async (req, res) => {
  if (typeof req.body.token === 'undefined'
    || typeof req.body.email === 'undefined') {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }

  let token = req.body.token;
  let email = req.body.email;
  try {
    await jwt.verify(token, secret_key, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          res.status(200).json({ error: 'expirated' });
          return;
        } else {
          res.status(500).json({ msg: "Something when wrong!" });
        }
      } else {
        if (decoded.email == email) {
          res.status(200).json({ msg: 'success' });
          return;
        }
      }
    });
  }
  catch (err) {
    res.status(404).json({ msg: 'unsuccess' });
    return
  }
}