// -------------------- Custom default response structure --------------------
exports.customResponse = (res, code, message, data) => {
  res.status(code).json({
    status: code,
    success: code >= 200 && code < 400,
    message,
    data,
  });
};
