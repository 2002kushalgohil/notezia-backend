const GlobalPromise = require("../middlewares/globalPromise");
const Card = require("../models/cardModel");
const User = require("../models/userModel");
const { customResponse } = require("../utils/responses");
const { isValidId } = require("../utils/isValidId");

exports.createCard = GlobalPromise(async (req, res) => {
  validateCardFields(req, res);

  req.body.createdBy = [req.user.id];
  const card = await Card.create(req.body);

  customResponse(res, 201, "Card created successfully", card);
});

exports.getAllCards = GlobalPromise(async (req, res) => {
  const cards = await Card.find({ createdBy: req.user.id });
  customResponse(res, 200, "", cards);
});

exports.getSpecificCards = GlobalPromise(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) {
    customResponse(res, 400, "Invalid card Id");
  }

  const card = await Card.findById(id);

  if (!card) {
    customResponse(res, 400, "Card not found");
  }

  customResponse(res, 200, "", card);
});

exports.editCard = GlobalPromise(async (req, res) => {
  const id = req.params.id;
  validateCardFields(req, res);

  if (!isValidId(id)) {
    return customResponse(res, 400, "Invalid card Id");
  }

  req.body.lastEdited = Date.now();
  const card = await Card.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!card) {
    return customResponse(res, 400, "Card not found");
  }

  customResponse(res, 200, "Card Successfully Edited", card);
});

exports.deleteCard = GlobalPromise(async (req, res) => {
  const id = req.params.id;

  if (!isValidId(id)) {
    return customResponse(res, 400, "Invalid card Id");
  }

  const card = await Card.findById(id);

  if (!card) {
    return customResponse(res, 400, "Card not found");
  }

  await Card.findByIdAndDelete(id);

  customResponse(res, 200, "Card Successfully Deleted");
});

const validateCardFields = (req, res) => {
  const { title, text } = req.body;

  if (!(title && text)) {
    return customResponse(res, 400, "Please fill all the details");
  }
};
