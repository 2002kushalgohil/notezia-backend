const GlobalPromise = require("../middlewares/globalPromise");
const Card = require("../models/cardModel");
const User = require("../models/userModel");
const { customResponse } = require("../utils/responses");
const { imageUploader, imageDestroyer } = require("../utils/imageHelper");
const { isValidId } = require("../utils/isValidId");

exports.createCard = GlobalPromise(async (req, res) => {    
  validateCardFields(req, res);

  if (req.files) {
    req.body.photos = await imageUploader(req, {
      folder: "card",
    });
  }

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
    customResponse(res, 404, "Card not found");
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
    return customResponse(res, 404, "Card not found");
  }

  customResponse(res, 200, "Card Successfully Edited", card);
});

exports.deleteCardImage = GlobalPromise(async (req, res) => {
  const imageId = req.query.imageId;
  const cardId = req.params.id;

  if (!isValidId(cardId)) {
    return customResponse(res, 400, "Invalid card Id");
  }

  const card = await Card.findById(cardId);

  if (!card) {
    return customResponse(res, 404, "Card not found");
  }

  const isImagePresent = card.photos.find((data) => data.id == imageId);
  if (!isImagePresent) {
    return customResponse(res, 400, "Image not Valid");
  }

  card.photos = card.photos.filter((data) => data.id != imageId);
  await imageDestroyer(imageId);
  req.body.lastEdited = Date.now();
  await card.save({ validateBeforeSave: false });

  return customResponse(res, 200, "Image deleted", card);
});

exports.addCardImage = GlobalPromise(async (req, res) => {
  if (!req.files) {
    return customResponse(res, 404, "Please attach image");
  }
  const cardId = req.params.id;

  if (!isValidId(cardId)) {
    return customResponse(res, 400, "Invalid card Id");
  }

  const card = await Card.findById(cardId);

  if (!card) {
    return customResponse(res, 404, "Card not found");
  }

  if (req.files) {
    const response = await imageUploader(req, {
      folder: "card",
    });
    card.photos.push(response[0]);
  }
  req.body.lastEdited = Date.now();
  await card.save({ validateBeforeSave: false });

  return customResponse(res, 200, "Image deleted", card);
});

exports.deleteCard = GlobalPromise(async (req, res) => {
  const id = req.params.id;

  if (!isValidId(id)) {
    return customResponse(res, 400, "Invalid card Id");
  }

  const card = await Card.findById(id);

  if (!card) {
    return customResponse(res, 404, "Card not found");
  }

  if (card.photos.length > 0) {
    for (let i = 0; i < card.photos.length; i++) {
      await imageDestroyer(card.photos[i].id);
    }
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
