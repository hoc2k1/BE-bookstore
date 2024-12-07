'use strict'
const home_controller = require('../controllers/home.controller');
module.exports = (app) => {
  app.route('/home/bestsellers')
    .get(home_controller.getBestSellers);
  app.route('/home/newbooks')
    .get(home_controller.getNewBooks);
}