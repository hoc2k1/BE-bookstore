"use strict";
const publisher_controller = require("../controllers/publisher.controller");
module.exports = app => {
  app.route("/publisher").get(publisher_controller.getPublisher);
};
