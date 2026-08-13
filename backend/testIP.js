const axios = require("axios");

async function testIP() {
  try {
    const response = await axios.get("https://webhook.site/e5ecf8ce-a4aa-41f4-9230-97bd7f4b3df1");

    console.log("Réponse :", response.status);
  } catch (error) {
    console.log("Erreur :", error.message);
  }
}

testIP();