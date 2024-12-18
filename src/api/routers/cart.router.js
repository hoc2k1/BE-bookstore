'use strict'
const cart_controller = require('../controllers/cart.controller');
module.exports = (app) => {
  app.route('/cart/add')
    .post(cart_controller.addNewCart)
  app.route('/cart/addtocard')
    .post(cart_controller.addToCart);
  app.route('/cart/:id')
    .get(cart_controller.getCartById);
  app.route('/cart/update')
    .post(cart_controller.update);
  app.route('/cart/delete/:id')
    .get(cart_controller.delete)
  app.route('/cart/deleteProduct')
    .post(cart_controller.deleteProduct)
}