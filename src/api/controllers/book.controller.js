'use strict'
const book = require('../models/book.model');
const publisherController = require('../controllers/publisher.controller');
const authorController = require('../controllers/author.controller');
const categoryController = require('../controllers/category.controller');
const NUMBER_BOOK_PER_PAGE = 30

exports.getTotalPage = (req, res) => {
  book.find({})
    .then(docs => {
      res.status(200).json({ data: parseInt((docs.length - 1) / NUMBER_BOOK_PER_PAGE) + 1 })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err.message });
    })
}

exports.getAllBook = async (req, res) => {
  if ((typeof req.body.page === 'undefined')) {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  //Khoang gia
  let range = null;
  if (req.body.range) {
    range = req.body.range;
  }
  //Search Text
  let searchText = req.body.searchText ? req.body.searchText : "";
  let searchPublisher;
  let searchAuthor;
  let searchCategory;
  if ((!req.body.searchPublisher || req.body.searchPublisher.length  == 0) && (!req.body.searchCategory || req.body.searchCategory.length == 0 ) && (!req.body.searchAuthor || req.body.searchAuthor.length == 0 )) {
    searchPublisher = await publisherController.getIDBySearchText(searchText);
    searchAuthor = await authorController.getIDBySearchText(searchText);
    searchCategory = await categoryController.getIDBySearchText(searchText);
  }
  else {
    if (req.body.searchPublisher && req.body.searchPublisher.length > 0) {
      searchPublisher = Array.isArray(req.body.searchPublisher) ? req.body.searchPublisher : [req.body.searchPublisher];
    }
    if (req.body.searchAuthor && req.body.searchAuthor.length > 0) {
      searchAuthor = Array.isArray(req.body.searchAuthor) ? req.body.searchAuthor : [req.body.searchAuthor];
    }
    if (req.body.searchCategory && req.body.searchCategory.length > 0) {
      searchCategory = Array.isArray(req.body.searchCategory) ? req.body.searchCategory : [req.body.searchCategory];
    }
  }

  let conditions = [];
  if (searchText) {
    conditions.push({ name: new RegExp(searchText, "i") })
  }
  if (searchPublisher) {
    conditions.push({ id_nsx: { $in: searchPublisher } })
  }
  if (searchAuthor) {
    conditions.push({ id_author: { $in: searchAuthor } })
  }
  if (searchCategory) {
    conditions.push({ id_category: { $in: searchCategory } })
  }

  //Sap xep
  let sortType = "release_date";
  let sortOrder = "-1";
  if (typeof req.body.sortType !== 'undefined') {
    sortType = req.body.sortType;
  }
  if (typeof req.body.sortOrder !== 'undefined') {
    sortOrder = req.body.sortOrder;
  }
  if ((sortType !== "price")
    && (sortType !== "release_date")
    && (sortType !== "view_counts")
    && (sortType !== "name")
    && (sortType !== "sales")) {
    res.status(422).json({ msg: 'Invalid sort type' });
    return;
  }
  if ((sortOrder !== "1")
    && (sortOrder !== "-1")) {
    res.status(422).json({ msg: 'Invalid sort order' });
    return;
  }
  //Trang va tong so trang
  let bookCount = null;
  try {
    if (range !== null) {
      bookCount = await book.countDocuments({ 
        $or: conditions,
        price: { $gte: range.low, $lte: range.high } 
      });
    }
    else {
      bookCount = await book.countDocuments({ 
        $or: conditions
      });
    }
  }
  catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }
  let totalPage = parseInt(((bookCount - 1) / NUMBER_BOOK_PER_PAGE) + 1);
  let { page } = req.body;
  if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
    res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
    return;
  }
  //De sort
  let sortQuery = {}
  sortQuery[sortType] = parseInt(sortOrder);
  //Lay du lieu
  if (range !== null) {
    try {
      const docs = await book
        .find({ 
          $or: conditions, 
          price: { $gte: range.low, $lte: range.high } 
        })
        .skip(NUMBER_BOOK_PER_PAGE * (parseInt(page) - 1))
        .limit(NUMBER_BOOK_PER_PAGE)
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage });
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }
  }
  else {
    try {
      const docs = await book
        .find({ $or: conditions })
        .skip(NUMBER_BOOK_PER_PAGE * (parseInt(page) - 1))
        .limit(NUMBER_BOOK_PER_PAGE)
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage });
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
}

exports.getBookByPublisher = async (req, res) => {
  if ((typeof req.body.page === 'undefined')
    || (typeof req.body.id === 'undefined')) {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let { id, page } = req.body;
  //Khoang gia
  let range = null;
  let objRange = null;
  if (typeof req.body.range !== 'undefined') {
    range = req.body.range;
    //objRange = JSON.parse(range);
    objRange = range;
  }
  //Search Text
  let searchText = "";
  if (typeof req.body.searchText !== 'undefined') {
    searchText = req.body.searchText;
  }
  //Sap xep
  let sortType = "release_date";
  let sortOrder = "-1";
  if (typeof req.body.sortType !== 'undefined') {
    sortType = req.body.sortType;
  }
  if (typeof req.body.sortOrder !== 'undefined') {
    sortOrder = req.body.sortOrder;
  }
  if ((sortType !== "price")
    && (sortType !== "release_date")
    && (sortType !== "view_counts")
    && (sortType !== "name")
    && (sortType !== "sales")) {
    res.status(422).json({ msg: 'Invalid sort type' });
    return;
  }
  if ((sortOrder !== "1")
    && (sortOrder !== "-1")) {
    res.status(422).json({ msg: 'Invalid sort order' });
    return;
  }
  //Trang va tong so trang
  let bookCount = null;
  try {
    if (range !== null) {
      bookCount = await book
        .countDocuments({ name: new RegExp(searchText, "i"), id_nsx: id, price: { $gte: objRange.low, $lte: objRange.high } });
    }
    else {
      bookCount = await book.countDocuments({ name: new RegExp(searchText, "i"), id_nsx: id });
    }
  }
  catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  let totalPage = parseInt(((bookCount - 1) / NUMBER_BOOK_PER_PAGE) + 1);
  if ((parseInt(page) < 1) || (parseInt(page) > totalPage)) {
    res.status(200).json({ data: [], msg: 'Invalid page', totalPage });
    return;
  }
  //De sort
  let sortQuery = {}
  sortQuery[sortType] = parseInt(sortOrder);
  //Lay du lieu
  if (range !== null) {
    try {
      const docs = await book.find({ name: new RegExp(searchText, "i"), id_nsx: id, price: { $gte: objRange.low, $lte: objRange.high } })
        .skip(NUMBER_BOOK_PER_PAGE * (parseInt(page) - 1))
        .limit(NUMBER_BOOK_PER_PAGE)
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage });
    }
    catch (error) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
  else {
    try {
      const docs = await book.find({ name: new RegExp(searchText, "i"), id_nsx: id })
        .skip(NUMBER_BOOK_PER_PAGE * (parseInt(page) - 1))
        .limit(NUMBER_BOOK_PER_PAGE)
        .sort(sortQuery)
      res.status(200).json({ data: docs, totalPage });
    }
    catch (error) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
}

exports.getBookByCategory = async (req, res) => {
  if (typeof req.body.id === 'undefined'
    || typeof req.body.page === 'undefined'
  ) {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let { id, page } = req.body;
  //Khoang gia
  let range = null;
  let objRange = null;
  if (typeof req.body.range !== 'undefined') {
    range = req.body.range;
    objRange = range;
  }
  //Kiem tra text
  let searchText = "";
  if (typeof req.body.searchText !== 'undefined') {
    searchText = req.body.searchText;
  }
  //Sap xep
  let sortType = "release_date";
  let sortOrder = "-1";
  if (typeof req.body.sortType !== 'undefined') {
    sortType = req.body.sortType;
  }
  if (typeof req.body.sortOrder !== 'undefined') {
    sortOrder = req.body.sortOrder;
  }
  if ((sortType !== "price")
    && (sortType !== "release_date")
    && (sortType !== "view_counts")
    && (sortType !== "name")
    && (sortType !== "sales")) {
    res.status(422).json({ msg: 'Invalid sort type' });
    return;
  }
  if ((sortOrder !== "1")
    && (sortOrder !== "-1")) {
    res.status(422).json({ msg: 'Invalid sort order' });
    return;
  }
  //Tinh tong so trang
  let bookCount, bookFind;
  try {
    if (range === null) {
      bookFind = await book.find({ id_category: id, name: new RegExp(searchText, "i") });
    } else {
      bookFind = await book.find({ id_category: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } });
    }
  }
  catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  bookCount = bookFind.length;
  let totalPage = parseInt(((bookCount - 1) / NUMBER_BOOK_PER_PAGE) + 1);
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).json({ data: [], msg: 'Invalid page', totalPage: totalPage });
    return;
  }
  //De sort
  let sortQuery = {}
  sortQuery[sortType] = parseInt(sortOrder);
  //Lay du lieu
  if (range === null) {
    try {
      const docs = await book.find({ id_category: id, name: new RegExp(searchText, "i") })
        .limit(NUMBER_BOOK_PER_PAGE)
        .skip(NUMBER_BOOK_PER_PAGE * (page - 1))
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage: totalPage });
    }
    catch (error) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  } else {
    try {
      const docs = await book.find({ id_category: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } })
        .limit(NUMBER_BOOK_PER_PAGE)
        .skip(NUMBER_BOOK_PER_PAGE * (page - 1))
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage: totalPage });
    }
    catch (error) {
      console.log(err);
      res.status(500).json({ error: err.message });
    }
  }
}

exports.getBookByAuthor = async (req, res) => {
  if (typeof req.body.id === 'undefined'
    || typeof req.body.page === 'undefined'
  ) {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let { id, page } = req.body;
  //Khoang gia
  let range = null;
  let objRange = null;
  if (typeof req.body.range !== 'undefined') {
    range = req.body.range;
    objRange = range;
  }
  //Kiem tra text
  let searchText = "";
  if (typeof req.body.searchText !== 'undefined') {
    searchText = req.body.searchText;
  }
  //Sap xep
  let sortType = "release_date";
  let sortOrder = "-1";
  if (typeof req.body.sortType !== 'undefined') {
    sortType = req.body.sortType;
  }
  if (typeof req.body.sortOrder !== 'undefined') {
    sortOrder = req.body.sortOrder;
  }
  if ((sortType !== "price")
    && (sortType !== "release_date")
    && (sortType !== "view_counts")
    && (sortType !== "name")
    && (sortType !== "sales")) {
    res.status(422).json({ msg: 'Invalid sort type' });
    return;
  }
  if ((sortOrder !== "1")
    && (sortOrder !== "-1")) {
    res.status(422).json({ msg: 'Invalid sort order' });
    return;
  }
  //De sort
  let sortQuery = {}
  sortQuery[sortType] = parseInt(sortOrder);
  //Tinh tong so trang
  let bookCount, bookFind;
  try {
    if (range === null) {
      bookFind = await book.find({ id_author: id, name: new RegExp(searchText, "i") });
    } else {
      bookFind = await book.find({ id_author: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } });
    }
  }
  catch (err) {
    res.status(500).json({ msg: err });
    return;
  }
  bookCount = bookFind.length;
  let totalPage = parseInt(((bookCount - 1) / NUMBER_BOOK_PER_PAGE) + 1);
  if (parseInt(page) < 1 || parseInt(page) > totalPage) {
    res.status(200).json({ data: [], msg: 'Invalid page', totalPage: totalPage });
    return;
  }
  //Lay du lieu
  if (typeof req.body.range === 'undefined') {
    try {
      const docs = await book.find({ id_author: id, name: new RegExp(searchText, "i") })
        .limit(NUMBER_BOOK_PER_PAGE)
        .skip(NUMBER_BOOK_PER_PAGE * (page - 1))
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage: totalPage });

    }
    catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }

  } else {
    try {
      const docs = await book.find({ id_author: id, name: new RegExp(searchText, "i"), price: { $gte: objRange.low, $lte: objRange.high } })
        .limit(NUMBER_BOOK_PER_PAGE)
        .skip(NUMBER_BOOK_PER_PAGE * (page - 1))
        .sort(sortQuery)

      res.status(200).json({ data: docs, totalPage: totalPage });
    }
    catch (err) {
      console.log(err);
      res.status(500).json({ msg: err.message });
    }

  }
}

exports.getBookByID = async (req, res) => {
  if (req.params.id === 'undefined') {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let result
  try {
    result = await book.findById(req.params.id);
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
  result.view_counts = result.view_counts + 1;
  result.save((err, docs) => {
    if (err) {
      console.log(err);
    }
  });
  res.status(200).json({ data: result })
}

exports.getRelatedBook = async (req, res) => {
  if (typeof req.params.bookId === 'undefined') {
    res.status(422).json({ msg: 'Invalid data' });
    return;
  }
  let { bookId } = req.params;
  let bookObj = null;
  try {
    bookObj = await book.findById(bookId);
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ msg: err })
    return;
  }
  if (bookObj === null) {
    res.status(200).json({ data: [], msg: 'Invalid bookId' });
    return;
  }
  try {
    const docs = await book
      .find({ $or: [{ $and: [{ id_category: bookObj.id_category }, { _id: { $nin: [bookId] } }] }, { $and: [{ id_author: bookObj.id_author }, { _id: { $nin: [bookId] } }] }] })
      .limit(5)
      .sort({ release_date: -1 })

    res.status(200).json({ data: docs });

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }

}