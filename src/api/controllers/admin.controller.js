"use strict";
var cloudinary = require("cloudinary").v2;
var uploads = {};
cloudinary.config({
  cloud_name: "dsjxs0xxt",
  api_key: "892963462585344",
  api_secret: "sGzUk7h3ptDQcuz_kGDQDec-QEs",
});

const book = require("../models/book.model");
const user = require("../models/user.model");
const category = require("../models/category.model");
const address = require("../models/address.model");
const author = require("../models/author.model");
const publisher = require("../models/publisher.model");
const constants = require("../../contants")
const bill = require('../models/bill.model')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const streamifier = require('streamifier');
const secret_key="mot_store"
const LIMIT = 2;
const fs = require("fs");

const uploadImg = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        public_id: `${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          console.log(error);
          reject(false);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
exports.addBook = async (req, res) => {
  if (
    typeof req.file === "undefined" ||
    typeof req.body.name === "undefined" ||
    typeof req.body.id_category === "undefined" ||
    typeof req.body.price === "undefined" ||
    typeof req.body.release_date === "undefined" ||
    typeof req.body.describe === "undefined" ||
    typeof req.body.id_publisher === "undefined" ||
    typeof req.body.id_author === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  const {
    id_category,
    name,
    price,
    release_date,
    describe,
    id_publisher,
    id_author,
  } = req.body;
  let urlImg = await uploadImg(req.file.buffer);
  if (urlImg === false) {
    res.status(500).json({ msg: "server error" });
    return;
  }
  const newBook = new book({
    id_category: id_category,
    name: name,
    price: price,
    release_date: release_date,
    img: urlImg,
    describe: describe,
    id_publisher: id_publisher,
    id_author: id_author,
  });
  try {
    newBook.save();
  } catch (err) {
    res.status(500).json({ msg: "server error" });
    return;
  }
  fs.unlink(req.file.buffer, (err) => {
    if (err) throw err;
  });
  res.status(201).json({ msg: "success" });
};
exports.updateBook = async (req, res) => {
  if (
    typeof req.body.name === "undefined" ||
    typeof req.body.id === "undefined" ||
    typeof req.body.id_category === "undefined" ||
    typeof req.body.price === "undefined" ||
    typeof req.body.release_date === "undefined" ||
    typeof req.body.describe === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { name, id, id_category, price, release_date, describe, category } =
    req.body;
  let bookFind;
  try {
    bookFind = await book.findById(id);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  if (bookFind === null) {
    res.status(404).json({ msg: "Not found" });
    return;
  }
  let urlImg = null;
  if (typeof req.file !== "undefined") {
    urlImg = await uploadImg(req.file.buffer);
  }
  if (urlImg !== null) {
    if (urlImg === false) {
      res.status(500).json({ msg: "server error" });
      return;
    }
  }
  if (urlImg === null) urlImg = bookFind.img;

  bookFind.id_category = id_category;
  bookFind.name = name;
  bookFind.price = parseFloat(price);
  bookFind.release_date = release_date;
  bookFind.describe = describe;
  bookFind.category = category;
  bookFind.img = urlImg;
  bookFind.save((err, docs) => {
    if (err) {
      console.log(err);
    }
  });

  res.status(200).json({ msg: "success", data: bookFind });
};

exports.deletebook = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let bookFind;
  try {
    bookFind = await book.findById(req.params.id);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  bookFind.remove();
  res.status(200).json({ msg: "success" });
};

exports.addPublisher = async (req, res) => {
  if (typeof req.body.name === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { name } = req.body;
  let publisherFind;
  try {
    publisherFind = await publisher.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (publisherFind.length > 0) {
    res.status(200).json({ error: "Tên nhà xuất bản đã tồn tại!" });
    return;
  }
  const newPublisher = new publisher({ name: name });
  try {
    await newPublisher.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  res.status(201).json({ msg: "success" });
};

exports.updatePublisher = async (req, res) => {
  if (
    typeof req.body.id === "undefined" ||
    typeof req.body.name === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { id, name } = req.body;
  let publisherFind;
  try {
    publisherFind = await publisher.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (publisherFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }
  let publisherFind1
  try {
    publisherFind1 = await publisher.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (publisherFind1.length > 0 && !(publisherFind1.length == 1 && publisherFind1[0].id == id)) {
    res.status(200).json({ error: "Tên nhà xuất bản đã tồn tại!" });
    return;
  }
  else {
    publisherFind.name = name;
    try {
      await publisherFind.save();
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
      return;
    }
    res.status(200).json({ msg: "success", publisher: { name: name } });
  }
};

exports.deleteUser = async (req, res) => {
  if (typeof req.params.id === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  try {
    const userFind = await user.findById(req.params.id)
    if (userFind) {
      await user.findByIdAndDelete(req.params.id);
      await address.deleteMany({ id_user: userFind._id });
      res.status(200).json({ msg: "success" });
      return;
    }
    else {
      res.status(500).json({ msg: err });
      return;
    }
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
};

exports.addCategory = async (req, res) => {
  if (
    typeof req.body.name === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { name } = req.body;
  let image = req.file
  let categoryFind;
  try {
    categoryFind = await category.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (categoryFind.length > 0) {
    res.status(200).json({ error: "Tên thể loại đã tồn tại" });
    return;
  }
  let urlImg = ''
  if (image) {
    urlImg = await uploadImg(image.buffer);
    if (urlImg === false) {
      res.status(500).json({ msg: "server error" });
      return;
    }
  }
  const newCategory = new category({ name: name, image: urlImg });
  try {
    await newCategory.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  res.status(201).json({ msg: "success" });
};

exports.updateCategory = async (req, res) => {
  if (
    typeof req.body.id === "undefined" ||
    typeof req.body.name === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { id, name } = req.body;
  let image = req.file

  let categoryFind;
  try {
    categoryFind = await category.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (categoryFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }
  let categoryFind1
  try {
    categoryFind1 = await category.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (categoryFind1.length > 0 && !(categoryFind1.length == 1 && categoryFind1[0].id == id)) {
    res.status(200).json({ error: "Tên thể loại đã tồn tại!" });
    return;
  }
  else {
    let urlImg = ''
    console.log(1, image)
    if (image) {
      urlImg = await uploadImg(image.buffer);
      if (urlImg === false) {
        res.status(500).json({ msg: "server error" });
        return;
      }
    }
    categoryFind.name = name;
    if (urlImg) {
      categoryFind.image = urlImg
    }
    try {
      await categoryFind.save();
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
      return;
    }
    res.status(200).json({ msg: "success", category: { id: id, name: name, image: urlImg } });
  }
};

exports.addAuthor = async (req, res) => {
  if (typeof req.body.name === "undefined") {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { name } = req.body;
  let authorFind;
  try {
    authorFind = await author.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (authorFind.length > 0) {
    res.status(200).json({ error: "Tên tác giả đã tồn tại!" });
    return;
  }
  const newAuthor = new author({ name: name });
  try {
    await newAuthor.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: err });
    return;
  }
  res.status(200).json({ msg: "success" });
};

exports.updateAuthor = async (req, res) => {
  if (
    typeof req.body.id === "undefined" ||
    typeof req.body.name === "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { id, name } = req.body;
  let authorFind;
  try {
    authorFind = await author.findById(id);
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (authorFind === null) {
    res.status(422).json({ msg: "not found" });
    return;
  }
  let authorFind1
  try {
    authorFind1 = await author.find({ name: name });
  } catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  if (authorFind1.length > 0 && !(authorFind1.length == 1 && authorFind1[0].id == id)) {
    res.status(200).json({ error: "Tên tác giả đã tồn tại!" });
    return;
  }
  else {
    authorFind.name = name;
    try {
      await authorFind.save();
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: err });
      return;
    }
    res.status(200).json({ msg: "success", author: { name: name } });
  }
};
exports.getAllUsers = async (req, res) => {
  let { page, searchText } = req.body;
  if (!page) page = 1;
  let filter;
  if (searchText) {
    filter = { email: new RegExp(searchText, "i") }
  }
  else filter = {}

  try {
    const totalCount = await user.countDocuments(filter);
    const totalPages = totalCount ? parseInt(((totalCount - 1) / LIMIT) + 1) : 1;
    const users = await user
      .find(filter)
      .skip(LIMIT * (parseInt(page) - 1))
      .limit(LIMIT)
    res.status(200).json({
      data: users.length > 0 ? users : [],
      totalPages: totalPages,
      currentPage: page,
      totalCount: totalCount
    });
    return;
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
exports.getAllAddresses = async (req, res) => {
  let { page, searchText } = req.body;
  if (!page) page = 1;

  try {
    let userIds = [];
    let filter;
    if (searchText) {
      const users = await user.find({ email: new RegExp(searchText, "i") });
      userIds = users.map(user => user._id);
      filter = userIds.length > 0 ? { id_user: { $in: userIds } } : {};
      if (userIds.length == 0) {
        res.status(200).json({
          data: [],
          totalPages: 1,
          currentPage: 1,
          totalCount: 0
        });
        return;
      }
    }
    else filter = {}

    const totalCount = await address.countDocuments(filter);

    const totalPages = totalCount ? parseInt(((totalCount - 1) / LIMIT) + 1) : 1;

    const addresses = await address
      .find(filter)
      .skip(LIMIT * (parseInt(page) - 1))
      .limit(LIMIT)
      .populate('id_user', 'email');

    const addressesWithEmail = await Promise.all(addresses.map(async (item) => {
      const findUser = await user.findById(item.id_user);
      const newItem = {...item._doc, email: findUser ? findUser.email : null};
      return newItem;
    }));
    res.status(200).json({
      data: addressesWithEmail,
      totalPages,
      currentPage: page,
      totalCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
exports.login = async (req, res) => {
  if (
    typeof req.body.email === "undefined" ||
    typeof req.body.password == "undefined"
  ) {
    res.status(422).json({ msg: "Invalid data" });
    return;
  }
  let { email, password } = req.body;
  let userFind = null;
  try {
    userFind = await user.findOne({ email: email, is_admin: true });
  } catch (err) {
    res.json({ msg: err });
    return;
  }
  if (userFind == null) {
    res.status(200).json({error: "Tài khoản hoặc mật khẩu không chính xác!"});
    return;
  }

  if (!bcrypt.compareSync(password, userFind.password)) {
    res.status(200).json({error: "Tài khoản hoặc mật khẩu không chính xác!"});
    return;
  }
  const token = jwt.sign(
    { email: email },
    secret_key,
    { expiresIn: '7d' }
  );
  res.status(200).json({
    msg: "success",
    token: token,
    user: {
      email: userFind.email,
      firstName: userFind.firstName,
      lastName: userFind.lastName,
      address: userFind.address,
      phone_number: userFind.phone_number,
      id: userFind._id,
    },
  });
};

exports.getRevenue = async (req, res) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return res.status(422).json({ msg: "Invalid data" });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const completedBills = await bill.find({
      status: constants.billStatus.complete,
      date_complete: {
        $gte: start,
        $lte: end,
      },
    });
    
    async function processCompletedBills(completedBills) {
      return Promise.all(completedBills.map(async (item) => {
        const updatedItem = { ...item._doc, products: [] };
    
        for (let product of item.products) {
          const categoryFind = await category.findById(product.id_category);
          const publisherFind = await publisher.findById(product.id_publisher);
          const authorFind = await author.findById(product.id_author);
    
          const updatedProduct = {
            ...product._doc,
            category: categoryFind ? categoryFind.name : null,
            publisher: publisherFind ? publisherFind.name : null,
            author: authorFind ? authorFind.name : null,
          };
    
          updatedItem.products.push(updatedProduct);
        }
    
        return updatedItem;
      }));
    }
    
    const updatedCompletedBills = await processCompletedBills(completedBills);

    const totalRevenue = completedBills.reduce((sum, bill) => sum + (bill.total || 0), 0);
    res.status(200).json({
      data: updatedCompletedBills,
      totalRevenue: totalRevenue,
    });
  } catch (err) {
    console.log(24, err)
    res.status(500).json({ msg: "An error occurred", error: err.message });
  }
}

exports.getBills = async (req, res) => {
  if (
    typeof req.body.page === "undefined" || 
    typeof req.body.status === "undefined"
  ) {
    res.status(402).json({ msg: "data invalid" });
    return;
  }
  const { status, page } = req.body
  try {
    const totalCount = await bill.countDocuments({status: status});
    const totalPages = totalCount ? parseInt(((totalCount - 1) / LIMIT) + 1) : 1;
    const bills = await bill
      .find({status: status})
      .skip(LIMIT * (parseInt(page) - 1))
      .limit(LIMIT)
    res.status(200).json({
      data: bills.length > 0 ? bills : [],
      totalPages: totalPages,
      currentPage: page,
      totalCount: totalCount
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
    return;
  }
}