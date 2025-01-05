"use strict";
const user = require("../models/user.model");
const nodemailer = require("../utils/nodemailer");
const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secret_key="mot_store"

exports.register = async (req, res) => {
  if (
    typeof req.body.email === "undefined" ||
    typeof req.body.password === "undefined" ||
    typeof req.body.firstName === "undefined" ||
    typeof req.body.lastName === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { email, password, firstName, lastName, is_admin } =
    req.body;
  if (
    (email.indexOf("@") === -1 && email.indexOf(".") === -1) ||
    password.length < 6
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let userFind = null;
  try {
    userFind = await user.find({ email: email });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (userFind.length > 0) {
    res.status(409).json({ msg: "Email already exist" });
    return;
  }
  const token = jwt.sign(
    { email: email },
    secret_key,
    { expiresIn: '7d' }
  );
  password = bcrypt.hashSync(password, 10);
  const newUser = new user({
    email: email,
    is_admin: is_admin,
    firstName: firstName,
    lastName: lastName,
    password: password,
    token: token,
  });
  try {
    await newUser.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  res.status(201).json({ msg: "success" });
};

exports.login = async (req, res) => {
  if (
    typeof req.body.email === "undefined" ||
    typeof req.body.password == "undefined"
  ) {
    res.status(402).json({ msg: "Invalid data" });
    return;
  }
  let { email, password } = req.body;
  let userFind = null;
  try {
    userFind = await user.findOne({ email: email });
  } catch (err) {
    res.json({ msg: err });
    return;
  }
  if (userFind == null) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }

  if (!bcrypt.compareSync(password, userFind.password)) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const token = jwt.sign(
    { email: email },
    secret_key,
    { expiresIn: '7d' }
  );
  userFind.token = token;
  try {
    await userFind.save();
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({
    msg: "success",
    token: token,
    user: {
      email: userFind.email,
      firstName: userFind.firstName,
      lastName: userFind.lastName,
      id: userFind._id,
    },
  });
};

exports.updateInfor = async (req, res) => {
  if (
    typeof req.body.firstName === "undefined" ||
    typeof req.body.lastName === "undefined" ||
    typeof req.body.email === "undefined"
  ) {
    res.status(422).json({ msg: "Thông tin không hợp lệ" });
    return;
  }
  let { email, firstName, lastName, is_admin } = req.body;
  let userFind;
  try {
    userFind = await user.findOne({ email: email });
  } catch (err) {
    res.status(500).json({ msg: "Tài khoản không tồn tại!" });
    return;
  }
  if (userFind === null) {
    res.status(422).json({ msg: "Tài khoản không tồn tại!" });
    return;
  }
  const token = jwt.sign(
    { email: email },
    secret_key,
    { expiresIn: '7d' }
  );
  userFind.firstName = firstName;
  userFind.lastName = lastName;
  userFind.is_admin = is_admin;
  userFind.token = token;
  try {
    await userFind.save();
  } catch (err) {
    res.status(500).json({ msg: "Something when wrong!" });
    return;
  }
  res.status(200).json({
    msg: "success",
    token: token,
    user: {
      email: userFind.email,
      firstName: userFind.firstName,
      lastName: userFind.lastName,
      is_admin: is_admin,
      id: userFind._id,
    },
  });
};

exports.updatePassword = async (req, res) => {
  if (
    typeof req.body.oldPassword === "undefined" ||
    typeof req.body.newPassword === "undefined" ||
    typeof req.body.email === "undefined"
  ) {
    res.status(422).json({ msg: "Thông tin không hợp lệ" });
    return;
  }
  let { email, oldPassword, newPassword } = req.body;
  let userFind = null;
  try {
    userFind = await user.findOne({ email: email });
  } catch (err) {
    res.status(500).json({ msg: "Something when wrong!" });
    return;
  }
  if (userFind == null) {
    res.status(422).json({ msg: "Tài khoản không tồn tại!" });
    return;
  }
  if (!bcrypt.compareSync(oldPassword, userFind.password)) {
    res.status(200).json({ error: "Mật khẩu cũ không chính xác!" });
    return;
  }
  const token = jwt.sign(
    { email: email },
    secret_key,
    { expiresIn: '7d' }
  );
  userFind.password = bcrypt.hashSync(newPassword, 10);
  userFind.token = token;
  try {
    await userFind.save();
  } catch (err) {
    res.status(500).json({ msg: "Something when wrong!" });
    return;
  }
  res.status(200).json({
    msg: "success",
    token: token,
    user: {
      email: userFind.email,
      firstName: userFind.firstName,
      lastName: userFind.lastName,
      id: userFind._id,
    },
  });
};
