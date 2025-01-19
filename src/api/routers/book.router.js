'use strict'
const book_controller = require('../controllers/book.controller');
module.exports = (app) => {
  app.route('/book/allbook')
    .post(book_controller.getAllBook);

  app.route('/book/id/:id')
    .get(book_controller.getBookByID)

  app.route('/book/related/:bookId')
    .get(book_controller.getRelatedBook)

  app.route('/book/bestselling')
    .post(book_controller.bestSelling)
}