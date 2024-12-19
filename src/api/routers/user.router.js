'use strict'
const user_controller = require('../controllers/user.controller');
const auth = require('../utils/auth');
module.exports = (app) => {
  app.route('/user/register')
    .post(user_controller.register);

  app.route('/user/login')
    .post(user_controller.login);

  app.route('/auth')
    .post(auth.verify)

  app.route('/user/updateinfor')
    .post(user_controller.updateInfor)

  app.route('/user/updatepassword')
    .post(user_controller.updatePassword)
}