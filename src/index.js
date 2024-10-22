const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const routes = require('./routes');
const bodyParser = require('body-parser')
dotenv.config();
const app = express();
app.use(bodyParser.json());
routes(app);

const port = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_DB)
.then(() => {
    console.log('Connect DB successfully')
})
.catch((error) => {
    console.log('Error connect to DB: ', error)
})

app.listen(port , () => {
    console.log('Server is running in port: ', port)
})
