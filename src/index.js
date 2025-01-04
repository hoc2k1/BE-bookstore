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

// localhost
// const port = process.env.PORT
// mongoose.connect(process.env.MONGO_DB)
//   .then(() => {
//     console.log('Connect DB successfully')
//   })
//   .catch((error) => {
//     console.log('Error connect to DB: ', error)
//   })
// app.get('/', (req, res) => { res.send('welcome to mọt store') })

// app.listen(port, () => {
//   console.log('Server is running in port: ', port)
// })

// deploy
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connect DB successfully');
  } catch (error) {
    console.error('Error connecting to DB:', error);
    throw error;
  }
};

module.exports = async (req, res) => {
  await connectToDatabase();
  app(req, res);
};