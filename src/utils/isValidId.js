const mongoose = require("mongoose");

// -------------------- Check if the given id is valid mongodb id --------------------
module.exports = function isValidId(id) {
  if (!id || typeof id !== "string") {
    return false;
  }
  return mongoose.isValidObjectId(id);
};
