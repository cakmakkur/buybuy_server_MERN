require('dotenv').config();
const express = require('express');
const path = require('path')
const cors = require('cors');
const cookieParser = require('cookie-parser')
const app = express();

const Product = require('./model/Product')
const fs = require('fs').promises

const mongoose = require('mongoose')
const connectDB = require('./config/dbConn')
connectDB()

const admin_app = require('./routes/admin_app')
const products_api = require('./routes/products')
const user_api = require('./routes/user_api')
const credentials = require('./middleware/credentials')
const allowedOrigins = require('./config/allowedOrigins')

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin ) {
      // || !origin is dev-only. It should be removed in production. 
      callback(null, true)
    } else {
      console.log('origin: ' + origin)
      callback(new Error('Not allowed by cors...'))
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'OPTIONS', 'DELETE'],
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions));
app.use(credentials)

app.use(express.urlencoded({ extended: false, limit: '50mb'}))
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/anotherDir', express.static(path.join(__dirname, 'public')));
// this makes the public folder also available to another directory other than the server.js
app.use('/product_imgs', express.static(path.join(__dirname, 'db', 'product_images'), 
{
  setHeaders: function (res, path, stat) {
    res.set('Cache-Control', 'public, max-age=31557600'); // Cache (1 year)
  }
}));

app.use('/admin', admin_app)
app.use('/api', products_api)
app.use('/user_api', user_api)

app.options('*', cors(corsOptions))

app.use(function (err, req, res, next) {
  console.log('Error caught: ' + err.stack)
  res.status(500).send(err.message)
})



app.get('/', async (req, res) => {
  res.send('Hello, welcome to Buy-Buy Server!');
});

const PORT = process.env.PORT || 9009

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}...`)
  })
})
