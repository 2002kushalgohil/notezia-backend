const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middlewares/isLoggedIn");
const {
  createCard,
  getAllUserCards,
  getCardById,
  editCard,
  deleteCard,
  editCardPriority,
} = require("../controllers/cardController");

// ------------------------ Card Routes ------------------------
router.post("/", isLoggedIn, createCard);
router.get("/", isLoggedIn, getAllUserCards);
router.get("/:id", isLoggedIn, getCardById);
router.patch("/:id", isLoggedIn, editCard);
router.patch("/cardPriorities", isLoggedIn, editCardPriority);
router.delete("/:id", isLoggedIn, deleteCard);

module.exports = router;
