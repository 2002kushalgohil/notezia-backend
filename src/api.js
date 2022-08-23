const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const connectWithDB = require("../src/config/db");
const cloudinary = require("cloudinary");
const serverless = require("serverless-http");

const app = express();
const router = express.Router();

connectWithDB();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

const user = require("../src/routes/userRoute");
const card = require("../src/routes/cardRoute");

router.use("/user/", user);
router.use("/card/", card);

app.use(`/.netlify/functions/api`, router);

module.exports.handler = serverless(app);
