const db = require("../config/database");

const {
    initializeCinetPayPayment
} = require("../services/cinetpayService");


// ==========================================
// INITIALISER UN PAIEMENT
// ==========================================

exports.createPayment = async (req, res) => {

    try {

        const {
            bookingId,
            amount,
            currency,
            description,
            clientName,
            clientEmail,
            clientPhone
        } = req.body;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!bookingId || !amount) {

            return res.status(400).json({
                message: "bookingId et montant obligatoires"
            });

        }


        if (!clientEmail) {

            return res.status(400).json({
                message: "Email client obligatoire"
            });

        }


        // ==========================================
        // VÉRIFIER LA RÉSERVATION
        // ==========================================

        const [booking] = await db.query(
            "SELECT * FROM bookings WHERE id = ?",
            [bookingId]
        );


        if (booking.length === 0) {

            return res.status(404).json({
                message: "Réservation introuvable"
            });

        }


        // ==========================================
        // NOM CLIENT
        // ==========================================

        const parts = (clientName || "Client LuxeStay")
            .trim()
            .split(/\s+/);


        const clientFirstName = parts.shift() || "Client";

        const clientLastName =
            parts.join(" ") || "LuxeStay";


        // ==========================================
        // ID UNIQUE DE TRANSACTION
        // MAXIMUM 30 CARACTÈRES
        // ==========================================

        const merchantTransactionId =
            `LS${bookingId}${Date.now()}`;


        // ==========================================
        // URLS
        // ==========================================

        const frontendUrl =
            process.env.FRONTEND_URL ||
            "http://localhost:5173";


        const backendUrl =
            process.env.BACKEND_URL ||
            "http://localhost:3000";


        const successUrl =
            `${frontendUrl}/payment?booking_id=${bookingId}&payment=success`;


        const failedUrl =
            `${frontendUrl}/payment?booking_id=${bookingId}&payment=failed`;


        const notifyUrl =
            `${backendUrl}/api/payments/notify`;


        // ==========================================
        // REQUÊTE CINETPAY
        // ==========================================

        const paymentData = {

            currency: currency || "XOF",

            merchant_transaction_id:
                merchantTransactionId,

            amount: Number(amount),

            lang: "fr",

            designation:
                description ||
                `Réservation LuxeStay #${bookingId}`,

            client_email:
                clientEmail,

            client_phone_number:
                clientPhone || undefined,

            client_first_name:
                clientFirstName,

            client_last_name:
                clientLastName,

            direct_pay: false,

            success_url:
                successUrl,

            failed_url:
                failedUrl,

            notify_url:
                notifyUrl

        };


        console.log(
            "➡️ Initialisation CinetPay :",
            {
                bookingId,
                amount,
                merchantTransactionId
            }
        );


        // ==========================================
        // APPEL CINETPAY
        // ==========================================

        const cinetPayResponse =
            await initializeCinetPayPayment(
                paymentData
            );


        console.log(
            "⬅️ Réponse CinetPay :",
            cinetPayResponse
        );


        // ==========================================
        // VÉRIFIER LA RÉPONSE
        // ==========================================

        if (
            cinetPayResponse.code !== 200 ||
            !cinetPayResponse.payment_url
        ) {

            return res.status(400).json({

                message:
                    cinetPayResponse.details?.message ||
                    "Impossible d'initialiser le paiement CinetPay.",

                cinetPay: cinetPayResponse

            });

        }


        // ==========================================
        // RÉPONSE FRONTEND
        // ==========================================

        return res.json({

            message:
                "Paiement CinetPay initialisé",

            bookingId,

            amount,

            transactionId:
                cinetPayResponse.transaction_id,

            merchantTransactionId:
                cinetPayResponse.merchant_transaction_id,

            paymentUrl:
                cinetPayResponse.payment_url

        });


    } catch (error) {

        console.error(
            "❌ Erreur paiement :",
            error.response?.data ||
            error.message
        );


        return res.status(500).json({

            message:
                "Erreur lors de l'initialisation du paiement.",

            error:
                error.response?.data ||
                error.message

        });

    }

};  