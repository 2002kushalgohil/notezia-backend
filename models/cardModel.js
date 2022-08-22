const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  createdBy: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  ],

  title: {
    type: String,
    required: [true, "Please provide a title"],
  },

  text: {
    type: String,
    required: [true, "Please provide text"],
  },

  backgroundColor: {
    type: String,
    required: [true, "Please provide a background color"],
    default: "#ffff",
  },

  photos: [
    {
      id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
  ],

  isPinned: {
    type: Boolean,
    default: false,
  },

  label: {
    type: String,
    default: "",
  },

  lastEdited: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Card", cardSchema);
