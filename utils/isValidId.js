const mongoose = require("mongoose");

exports.isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};
