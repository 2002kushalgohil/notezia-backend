const globalPromise = require("../middlewares/globalPromise");
const { response } = require("../utils/responses");
const Card = require("../models/cardModel");
const User = require("../models/userModel");
const { isValidId } = require("../utils/isValidId");

exports.createCard = globalPromise(async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const card = await Card.create(req.body);

    req.user.cards = [card._id, ...req.user.cards];
    await req.user.save();

    response(res, 200, "Card created", card);
  } catch (error) {
    console.log(error);
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.getAllUserCards = globalPromise(async (req, res) => {
  try {
    const users = await User.findOne({ _id: req.user._id }).populate({
      path: "cards",
      model: "Card",
    });
    response(res, 200, "", users.cards);
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

    req.user.cards = req.user.cards.filter((item) => item !== id);

    await req.user.save();

    response(res, 200, "Card deleted");
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});

exports.editCardPriority = globalPromise(async (req, res) => {
  try {
    const { cards } = req.body;

    if (!cards) {
      return response(res, 400, "Please fill all the details");
    }

    req.user.cards = cards;
    await req.user.save();

    return response(res, 200, "Card priority changed");
  } catch (error) {
    return response(res, 400, "!Opps something went wrong");
  }
});
