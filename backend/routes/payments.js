const express = require("express");

const router = express.Router();

const paymentController =
    require("../controllers/paymentController");


// Initialisation paiement
router.post(
    "/init",
    paymentController.createPayment
);


// Notification CinetPay
router.post(
    "/notify",
    (req, res) => {

        console.log(
            "🔔 Notification CinetPay reçue :",
            req.body
        );

        res.status(200).json({
            message: "Notification reçue"
        });

    }
);


module.exports = router;