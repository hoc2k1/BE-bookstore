'use strict'
const address = require('../models/address.model');
const user = require('../models/user.model')
exports.getAllAddress = async (req, res) => {
  let conditions = {}
  if (req.body.id_user) {
    conditions = {id_user: req.body.id_user};
  }
  if (req.body.id_user) {
    let userFind;
    try {
      userFind = await user.findById(req.body.id_user);
    } catch (err) {
      res.status(500).json({ msg: err });
      return;
    }
    if (userFind === null) {
      res.status(422).json({ msg: "not found" });
      return;
    }
  }
  address.find(conditions)
    .then(docs => {
      res.status(200).json({ data: docs })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ msg: err });
    })
}
exports.addNewAddress = async (req, res) => {
  if (
    typeof req.body.firstName === "undefined" ||
    typeof req.body.lastName === "undefined" ||
    typeof req.body.province === "undefined" ||
    typeof req.body.district === "undefined" ||
    typeof req.body.phoneNumber === "undefined" ||
    typeof req.body.id_user === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const { firstName, lastName, province, district, commune, 
    specificAddress, phoneNumber, id_user } =
    req.body;
  let userFind;
  try {
    userFind = await user.findById(id_user);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (userFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }
  const newAddress = new address({
    id_user: id_user,
    firstName: firstName,
    lastName: lastName,
    province: province,
    district: district,
    commune: commune, 
    specificAddress: specificAddress, 
    phoneNumber: phoneNumber
  })
  try {
    await newAddress.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({
    msg: "success",
  });
}
exports.deleteAddress = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let addressFind;
  try {
    addressFind = await address.findById(req.params.id);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  try {
    await address.findByIdAndDelete(req.params.id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "success" });
}
exports.updateAddress = async (req, res) => {
  if (
    typeof req.body.firstName === "undefined" ||
    typeof req.body.lastName === "undefined" ||
    typeof req.body.province === "undefined" ||
    typeof req.body.district === "undefined" ||
    typeof req.body.phoneNumber === "undefined" ||
    typeof req.body.id === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { firstName, lastName, province, district, commune, 
    specificAddress, phoneNumber, id } =
    req.body;
  let addressFind;
  try {
    addressFind = await address.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (addressFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }
  addressFind.firstName = firstName;
  addressFind.lastName = lastName;
  addressFind.province = province;
  addressFind.district = district;
  addressFind.commune = commune;
  addressFind.specificAddress = specificAddress;
  addressFind.phoneNumber = phoneNumber;
  try {
    await addressFind.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({
    msg: "success",
    address: {
      id_user: addressFind.id_user,
      firstName: addressFind.firstName,
      lastName: addressFind.lastName,
      province: addressFind.province,
      district: addressFind.district,
      commune: addressFind.commune,
      specificAddress: addressFind.specificAddress,
      phoneNumber: addressFind.phoneNumber
    },
  });
}