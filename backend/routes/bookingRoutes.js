const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        message: "Route bookings OK"
    });
});

module.exports = router;