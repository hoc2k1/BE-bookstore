'use strict'
const book = require('../models/book.model');
const NUMBER_BOOK_PER_PAGE = 24
const NUMBER_RELATED_BOOK = 8

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
  if (req.body.objRange) {
    range = req.body.objRange;
  }
  //Search Text
  let searchText = req.body.searchText ? req.body.searchText : "";
  let searchPublisher;
  let searchAuthor;
  let searchCategory;
  if ((!req.body.searchPublisher || req.body.searchPublisher.length == 0) && (!req.body.searchCategory || req.body.searchCategory.length == 0) && (!req.body.searchAuthor || req.body.searchAuthor.length == 0)) {
    searchPublisher = null
    searchAuthor = null
    searchCategory = null
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
        $and: [
          ...conditions,
          {
            $expr: {
              $and: [
                {
                  $gte: [
                    { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$sales', 100] }] }] },
                    range.low,
                  ],
                },
                {
                  $lte: [
                    { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$sales', 100] }] }] },
                    range.high,
                  ],
                },
              ],
            },
          }
        ]
      });
    }
    else {
      bookCount = await book.countDocuments({
        $and: conditions
      });
    }
  }
  catch (err) {
    res.status(500).json({ error: err.message });
    return;
  }
  let totalPage = bookCount ? parseInt(((bookCount - 1) / NUMBER_BOOK_PER_PAGE) + 1) : 1;
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
          $and: [
            ...conditions,
            {
              $expr: {
                $and: [
                  {
                    $gte: [
                      { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$sales', 100] }] }] },
                      range.low,
                    ],
                  },
                  {
                    $lte: [
                      { $subtract: ['$price', { $multiply: ['$price', { $divide: ['$sales', 100] }] }] },
                      range.high,
                    ],
                  },
                ],
              },
            }
          ]
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
        .find({ $and: conditions })
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
  result.save()
    .then(res1 => {
      console.log('');
    })
    .catch(error => {
      console.error('Error saving document:', error);
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
    const releatedBooksByCategory = await book
      .find({
        $and: [
          { id_category: bookObj.id_category },
          { _id: { $nin: [bookId] } }
        ]
      })
      .limit(NUMBER_RELATED_BOOK)
      .sort({ release_date: -1 });
    const releatedBooksByCategoryCount = await book.countDocuments({
      $and: [
        { id_category: bookObj.id_category },
        { _id: { $nin: [bookId] } }
      ]
    })
    const releatedBooksByPublisher = await book
      .find({
        $and: [
          { id_nsx: bookObj.id_nsx },
          { _id: { $nin: [bookId] } }
        ]
      })
      .limit(NUMBER_RELATED_BOOK)
      .sort({ release_date: -1 });
    const releatedBooksByPublisherCount = await book.countDocuments({
      $and: [
        { id_nsx: bookObj.id_nsx },
        { _id: { $nin: [bookId] } }
      ]
    })
    const releatedBooksByAuthor = await book
      .find({
        $and: [
          { id_author: bookObj.id_author },
          { _id: { $nin: [bookId] } }
        ]
      })
      .limit(NUMBER_RELATED_BOOK)
      .sort({ release_date: -1 });

    const releatedBooksByAuthorCount = await book.countDocuments({
      $and: [
        { id_author: bookObj.id_author },
        { _id: { $nin: [bookId] } }
      ]
    });
    res.status(200).json({ 
      data: {
        releatedBooksByCategory: {
          data: releatedBooksByCategory,
          totalPage: releatedBooksByCategoryCount ? parseInt(((releatedBooksByCategoryCount - 1) / NUMBER_RELATED_BOOK) + 1) : 1
        },
        releatedBooksByPublisher: {
          data: releatedBooksByPublisher,
          totalPage: releatedBooksByPublisherCount ? parseInt(((releatedBooksByPublisherCount - 1) / NUMBER_RELATED_BOOK) + 1) : 1
        },
        releatedBooksByAuthor: {
          data: releatedBooksByAuthor,
          totalPage: releatedBooksByAuthorCount ? parseInt(((releatedBooksByAuthorCount - 1) / NUMBER_RELATED_BOOK) + 1) : 1
        },
        limitRelatedBooks: NUMBER_RELATED_BOOK
      }
    });

  }
  catch (err) {
    console.log(err);
    res.status(500).json({ msg: err.message });
  }

}