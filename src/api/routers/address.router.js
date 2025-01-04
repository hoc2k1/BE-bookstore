'use strict'
const address_vn_controller = require('../controllers/address.controller');
module.exports = (app) => {
  app.route('/address/all')
    .post(address_vn_controller.getAllAddress);
  app.route('/address/add')
    .post(address_vn_controller.addNewAddress);
  app.route('/address/delete/:id')
    .get(address_vn_controller.deleteAddress);
  app.route('/address/update')
    .post(address_vn_controller.updateAddress);
}