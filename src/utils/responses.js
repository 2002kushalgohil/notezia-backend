// -------------------- Custom default response structure --------------------
exports.response = (res, code, message, data) => {
  const isSuccess = code >= 200 && code < 400;

  res.status(code).json({
    status: code,
    success: isSuccess,
    message,
    data: data || null,
  });
};
