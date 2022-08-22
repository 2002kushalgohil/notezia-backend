const express = require("express");

require("dotenv").config();
const app = express();
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");

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

const user = require("./routes/userRoute");
const card = require("./routes/cardRoute");

app.use("/api/v1/user/", user);
app.use("/api/v1/card/", card);

module.exports = app;
