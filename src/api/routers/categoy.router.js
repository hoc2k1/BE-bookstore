'use strict'
const category_controller = require('../controllers/category.controller');
module.exports = (app) => {
  app.route('/category/all')
    .get(category_controller.getCategory);
}