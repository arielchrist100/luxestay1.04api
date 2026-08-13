require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/database");

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// TEST CONNEXION MYSQL
// ===============================

(async () => {
    try {
        const connection = await db.getConnection();

        console.log("✅ Connexion MySQL réussie");

        connection.release();
    } catch (error) {
        console.error("❌ Erreur MySQL :", error);
    }
})();

// ===============================
// ROUTE PRINCIPALE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Backend LuxeStay fonctionne."
    });
});

// ===============================
// ROUTES API
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

console.log("✅ Routes API enregistrées");

// ===============================
// SERVEUR
// ===============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur  ${PORT}`);
});