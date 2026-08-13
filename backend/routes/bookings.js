const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingController");

// Créer une réservation
router.post("/", bookingController.createBooking);

module.exports = router;