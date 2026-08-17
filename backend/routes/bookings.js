const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/bookingcontroller");

// Créer une réservation
router.post("/", bookingController.createBooking);

module.exports = router;