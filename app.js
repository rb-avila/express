const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const productRoutes = require("./api/routes/products");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/users");

// mongoose.connect(
//     "mongodb://immiwise:" + process.env.MONGO_ATLAS_PW + "@express-shard-00-00-w9i30.mongodb.net:27017,express-shard-00-01-w9i30.mongodb.net:27017,express-shard-00-02-w9i30.mongodb.net:27017/test?ssl=true&replicaSet=express-shard-0&authSource=admin&retryWrites=true"
//     , {
//         useMongoClient: true
//     }
// );
// mongoose.Promise = global.Promise;

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/express";
    mongoose.connect(MONGODB_URI);

    app.use(morgan("dev"));
    app.use('/uploads', express.static('uploads'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
      }
      next();
    });
    
    // Routes which should handle requests
    app.use("/products", productRoutes);
    app.use("/orders", orderRoutes);
    app.use("/users", userRoutes);
    
    app.use((req, res, next) => {
      const error = new Error("Not found");
      error.status = 404;
      next(error);
    });
    
    app.use((error, req, res, next) => {
      res.status(error.status || 500);
      res.json({
        error: {
          message: error.message
        }
      });
    });
    

module.exports = app;