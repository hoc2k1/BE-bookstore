'use strict'
const author_controller = require('../controllers/author.controller');
module.exports = (app) => {
  app.route('/author')
    .get(author_controller.getAuthor);
}