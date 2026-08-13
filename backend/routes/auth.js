const express = require("express");
const router = express.Router();

router.post("/sync", async (req, res) => {
  try {
    // Synchronisation utilisateur
    res.status(200).json({
      message: "Utilisateur synchronisé"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;