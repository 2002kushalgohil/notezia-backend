// Global promise so that we do not need to use try catch every where
module.exports = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
