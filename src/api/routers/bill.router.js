'use strict'
const bill_controller = require('../controllers/bill.controller');
module.exports = (app) => {
  app.route('/bill/getallbill/:id_user')
    .get(bill_controller.getBillByIDUser);
  app.route('/bill/findoradd')
    .post(bill_controller.findBillOrAddBill);
  app.route('/bill/checkout/:id')
    .get(bill_controller.checkout);
  app.route('/bill/update')
    .post(bill_controller.updateBill);
  app.route('/bill/getbill/:id')
    .get(bill_controller.findBillById)
}