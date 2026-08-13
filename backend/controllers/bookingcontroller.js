const db = require("../config/database");


// Créer une réservation
exports.createBooking = async (req, res) => {

  try {

    const {
      hotelId,
      firebaseUid,
      phone,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      specialRequest,
      amount

    } = req.body;


    // Vérification des données

    if (!hotelId || !firebaseUid || !checkIn || !checkOut) {

      return res.status(400).json({
        message: "Informations obligatoires manquantes"
      });

    }


    // Statut initial de la réservation
    const status = "pending";


    // Insertion dans MySQL

    const sql = `
      INSERT INTO bookings
      (
        hotel_id,
        firebase_uid,
        phone,
        check_in,
        check_out,
        nights,
        adults,
        children,
        special_request,
        amount,
        status
      )

      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [
      hotelId,
      firebaseUid,
      phone,
      checkIn,
      checkOut,
      nights,
      adults,
      children,
      specialRequest,
      amount,
      status
    ];


    const [result] = await db.query(sql, values);



    res.status(201).json({

      message: "Réservation créée avec succès",

      bookingId: result.insertId,

      status: status

    });



  } catch(error){

    console.log(error);

    res.status(500).json({

      message:"Erreur serveur"

    });

  }

};