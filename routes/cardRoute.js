const express = require("express");
const {
  createCard,
  getAllCards,
  getSpecificCards,
  editCard,
  deleteCard,
  deleteCardImage,
  addCardImage,
} = require("../controllers/cardController");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");

router.route("/").post(isLoggedIn, createCard);
router.route("/").get(isLoggedIn, getAllCards);
router.route("/:id").get(isLoggedIn, getSpecificCards);
router.route("/:id").patch(isLoggedIn, editCard);
router.route("/:id").delete(isLoggedIn, deleteCard);
router.route("/image/:id").delete(isLoggedIn, deleteCardImage);
router.route("/image/:id").patch(isLoggedIn, addCardImage);

module.exports = router;
