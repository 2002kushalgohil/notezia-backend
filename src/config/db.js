const mongoose = require("mongoose");

// -------------------- Database connection --------------------
const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Database connection successfully done"))
    .catch((err) => {
      console.log("Error in Database connectivity");
      console.log(err);
      process.exit(1);
    });
};

module.exports = connectWithDB;
