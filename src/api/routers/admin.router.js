'use strict'
const admin_controller = require('../controllers/admin.controller');
const multer = require('multer')
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = (app) => {
  app.route('/admin/addbook')
    .post(upload.array('files', 10), admin_controller.addBook);
  app.route('/admin/updatebook')
    .post(upload.array('files', 10), admin_controller.updateBook);
  app.route('/admin/deletebook/:id')
    .get(admin_controller.deletebook);
  app.route('/admin/deleteuser/:id')
    .get(admin_controller.deleteUser);
  app.route('/admin/addcategory')
    .post(upload.single('image'), admin_controller.addCategory);
  app.route('/admin/updatecategory')
    .post(upload.single('image'), admin_controller.updateCategory);
  app.route('/admin/addauthor')
    .post(admin_controller.addAuthor);
  app.route('/admin/updateauthor')
    .post(admin_controller.updateAuthor);
  app.route('/admin/addpublisher')
    .post(admin_controller.addPublisher);
  app.route('/admin/updatepublisher')
    .post(admin_controller.updatePublisher);
  app.route('/admin/getAllUsers')
    .post(admin_controller.getAllUsers);
  app.route('/admin/getAllAddresses')
    .post(admin_controller.getAllAddresses);
  app.route('/admin/login')
    .post(admin_controller.login);
  app.route('/admin/revenue')
    .post(admin_controller.getRevenue);
  app.route('/admin/bills')
    .post(admin_controller.getBills)
  app.route('/admin/deletebill/:id')
    .get(admin_controller.deleteBill)
}