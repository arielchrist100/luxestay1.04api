require("dotenv").config();
const { getCinetPayToken } = require("./services/cinetpayService");


async function test(){

    try {

       
      const token = await getCinetPayToken();

        console.log("✅ Connexion CinetPay réussie");
        console.log("TOKEN :", token);

    } catch(error){

 console.log(
   error.response?.data || error.message
 );

}
}


test();