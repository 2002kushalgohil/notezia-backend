// -------------------- Global promise to avoid error --------------------
module.exports = (func) => (req, res, next) =>
  Promise.resolve(func(req, res, next)).catch(next);
