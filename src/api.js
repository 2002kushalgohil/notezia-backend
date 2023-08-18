const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectWithDB = require("./config/db");
const serverless = require("serverless-http");
const app = express();
const router = express.Router();

// -------------------- DB connection --------------------
connectWithDB();

// -------------------- Middlewares --------------------
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// -------------------- Routes --------------------
const user = require("./routes/userRoute");
const card = require("./routes/cardRoute");
router.use("/user/", user);
router.use("/card/", card);

// -------------------- Redirect route to Lamda functions --------------------
app.use(`/.netlify/functions/api`, router);

// -------------------- Serverless app for netlify --------------------
module.exports.handler = serverless(app);
