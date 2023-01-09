const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.ObjectId,
    required: [true, "User not found"],
  },

  title: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("Card", cardSchema);
