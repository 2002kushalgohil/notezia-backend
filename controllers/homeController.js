const GlobalPromise = require("../middlewares/globalPromise");

exports.home = GlobalPromise(async (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Welcome to Notezia",
  });
});
