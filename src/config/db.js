const mongoose = require("mongoose");

// -------------------- Database connection --------------------
const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Database connection successfully done");
    })
    .catch((err) => {
      console.log("Error in Database connectivity");
      console.error(err);
      process.exit(1);
    });

  mongoose.connection.on("connected", () => {
    console.log("Connected to MongoDB");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB connection disconnected");
  });
};

module.exports = connectWithDB;
