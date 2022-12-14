const mongoose = require("mongoose");

// -------------------- Check if the given id is valid mongodb id --------------------
exports.isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};
