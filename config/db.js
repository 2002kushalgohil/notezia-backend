const mongoose = require("mongoose");

// Database connection
const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("DB connected"))
    .catch((err) => {
      console.log("DB connections issue");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDB;
