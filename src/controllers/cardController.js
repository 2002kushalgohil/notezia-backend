const globalPromise = require("../middlewares/globalPromise");
const { response } = require("../utils/responses");
const Card = require("../models/cardModel");
const { isValidId } = require("../utils/isValidId");

exports.createCard = globalPromise(async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const card = await Card.create(req.body);

    response(res, 200, "Card created", card);
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.getAllUserCards = globalPromise(async (req, res) => {
  try {
    const cards = await Card.find({ createdBy: req.user.id });

    response(res, 200, "", cards);
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.getCardById = globalPromise(async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      response(res, 400, "Invalid card Id");
    }

    const card = await Card.findOne({
      _id: id,
      createdBy: req.user.id,
    });

    if (!card) {
      response(res, 404, "Card not found");
    }

    response(res, 200, "", card);
  } catch (error) {
    console.log(error);
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.editCard = globalPromise(async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return response(res, 400, "Invalid card Id");
    }
    const card = await Card.findOneAndUpdate(
      {
        _id: id,
        createdBy: req.user.id,
      },
      req.body,
      {
        new: true,
      }
    );

    if (!card) {
      response(res, 404, "Card not found");
    }

    response(res, 200, "Card updated", card);
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.deleteCard = globalPromise(async (req, res) => {
  try {
    const id = req.params.id;
    if (!isValidId(id)) {
      return response(res, 400, "Invalid card Id");
    }
    const card = await Card.findOneAndDelete({
      _id: id,
      createdBy: req.user.id,
    });

    if (!card) {
      response(res, 404, "Card not found");
    }

    response(res, 200, "Card deleted");
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});
