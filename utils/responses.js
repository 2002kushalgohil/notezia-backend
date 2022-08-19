exports.EmptyFieldRes = (res) =>
  res.status(400).json({
    status: 400,
    success: false,
    message: "Please fill all the information",
  });

exports.UserExistRes = (res) =>
  res.status(200).json({
    status: 200,
    success: false,
    message: "User already registered",
  });

exports.UserDoesNotExistRes = (res) =>
  res.status(404).json({
    status: 404,
    success: false,
    message: "User not registered",
  });

exports.InvalidCredRes = (res) =>
  res.status(401).json({
    status: 401,
    success: false,
    message: "Invalid credentials",
  });

exports.SomethingWentWrong = (res) =>
  res.status(500).json({
    status: 500,
    success: false,
    message: "Something went wrong",
  });

exports.PasswordDoesNotMatch = (res) =>
  res.status(401).json({
    status: 401,
    success: false,
    message: "Password and confirm password does not match",
  });

exports.TokenExpired = (res) =>
  res.status(404).json({
    status: 404,
    success: false,
    message: "Token Expired",
  });

exports.UnAuthorised = (res) =>
  res.status(401).json({
    status: 401,
    success: false,
    message: "UnAuthorised user",
  });
