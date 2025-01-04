const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRouter = require('./api/routers/user.router');
const categoryRouter = require('./api/routers/categoy.router');
const publisherRouter = require('./api/routers/publisher.router');
const bookRouter = require('./api/routers/book.router');
const authorRouter = require('./api/routers/author.router');
const commentRouter = require('./api/routers/comment.router');
const billRouter = require('./api/routers/bill.router');
const cartRouter = require('./api/routers/cart.router');
const adminRouter = require('./api/routers/admin.router');
const addressRouter = require('./api/routers/address.router');
const bannerRouter = require('./api/routers/banner.router');

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

userRouter(app);
categoryRouter(app);
publisherRouter(app);
bookRouter(app);
authorRouter(app);
commentRouter(app);
billRouter(app);
cartRouter(app);
adminRouter(app);
addressRouter(app);
bannerRouter(app);

mongoose.connect(process.env.MONGO_DB)
  .then(() => {
    console.log('Connect DB successfully')
  })
  .catch((error) => {
    console.log('Error connect to DB: ', error)
  })

app.get('/', (req, res) => {
  res.send('Welcome to mọt store');
});

module.exports = app;

// const port = process.env.PORT
// app.listen(port, () => {
//   console.log('Server is running in port: ', port)
// })
