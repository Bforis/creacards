const router = require('express').Router();

const authController = require('../../controllers/authController');
const cardController = require("../../controllers/cardController");

router.get("/",
    authController.authorizeRegisteredUser(['user', 'admin']),
    cardController.saveCard
);

router.get("/:cardId", cardController.fetchCard);

module.exports = router;