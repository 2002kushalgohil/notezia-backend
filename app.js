const express = require("express");
// dotenv initialization
require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

// import routes
const home = require("./routes/homeRoute");

// routes middleware
app.use("/api/v1/", home);

module.exports = app;
