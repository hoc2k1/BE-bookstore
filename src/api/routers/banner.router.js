'use strict'
const banner_controller = require('../controllers/banner.controller');
module.exports = (app) => {
  app.route('/banner/all')
    .get(banner_controller.getAll);
}