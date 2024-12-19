'use strict'
const bill_controller = require('../controllers/bill.controller');
module.exports = (app) => {
  app.route('/bill/:id_user')
    .get(bill_controller.getBillByIDUser);
  app.route('/bill/top/')
    .post(bill_controller.statisticalTop10);
  app.route('/bill/statistical/revenue/day')
    .post(bill_controller.statisticaRevenueDay);
  app.route('/bill/statistical/revenue/month')
    .post(bill_controller.statisticaRevenueMonth);
  app.route('/bill/statistical/revenue/year')
    .post(bill_controller.statisticaRevenueYear);
  app.route('/bill/statistical/revenue/quauter')
    .post(bill_controller.statisticaRevenueQuauter);
  app.route('/bill/status/0')
    .get(bill_controller.getProcessing);
  app.route('/bill/findoradd')
    .post(bill_controller.findBillOrAddBill);
  app.route('/bill/checkout/:id')
    .get(bill_controller.checkout);
  app.route('/bill/update')
    .post(bill_controller.updateBill);
    
}