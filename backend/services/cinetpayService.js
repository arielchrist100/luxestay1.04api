const axios = require("axios");
require("dotenv").config();

async function getCinetPayToken() {
    try {
        const response = await axios.post(
            `${process.env.CINETPAY_BASE_URL}/v1/oauth/login`,
            {
                api_key: process.env.CINETPAY_ACCOUNT_KEY,
                api_password: process.env.CINETPAY_ACCOUNT_PASSWORD
            }
        );

        return response.data.access_token;

    } catch (error) {
        console.log(
            "Erreur authentification CinetPay :",
            error.response?.data || error.message
        );

        throw error;
    }
}


// Initialisation d'un paiement CinetPay
async function initializeCinetPayPayment(paymentData) {

    try {
        const token = await getCinetPayToken();

        const response = await axios.post(
            `${process.env.CINETPAY_BASE_URL}/v1/payment`,
            paymentData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {

        console.log(
            "Erreur initialisation paiement CinetPay :",
            error.response?.data || error.message
        );

        throw error;
    }
}


module.exports = {
    getCinetPayToken,
    initializeCinetPayPayment
};