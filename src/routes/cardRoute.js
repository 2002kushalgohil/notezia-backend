const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const {
  createCard,
  getAllUserCards,
  getCardById,
  editCard,
  deleteCard,
} = require("../controllers/cardController");

// -------------------- Card Routes --------------------
router.route("/").post(isLoggedIn, createCard);
router.route("/").get(isLoggedIn, getAllUserCards);
router.route("/:id").get(isLoggedIn, getCardById);
router.route("/:id").patch(isLoggedIn, editCard);
router.route("/:id").delete(isLoggedIn, deleteCard);

module.exports = router;
