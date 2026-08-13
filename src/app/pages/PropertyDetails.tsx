import { useParams, useNavigate } from 'react-router-dom';
import { properties } from '../data/properties';
import { 
  MapPin, Star, Users, BedDouble, Bath, Wifi, 
  Car, Utensils, Wind, ArrowLeft, Calendar, X, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { useState } from 'react';

export function PropertyDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const property = properties.find(p => p.slug === slug);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Propriété non trouvée</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    'WiFi': Wifi,
    'WiFi Ultra-Rapide': Wifi,
    'Parking': Car,
    'Restaurant': Utensils,
    'Piscine': Wind,
    'Piscine Infinity': Wind,
    'Spa': Wind,
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = property.price * nights;
    const serviceFee = Math.round(subtotal * 0.1);
    navigate('/reservation', {
      state: {
        propertyId: property.id,
        propertyTitle: property.title,
        propertyLocation: property.location,
        propertyImage: property.image,
        checkIn,
        checkOut,
        nights,
        pricePerNight: property.price,
        subtotal,
        serviceFee,
        total: subtotal + serviceFee,
      },
    });
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * property.price : 0;
  };

  const nights = calculateTotal() / property.price || 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const nextModalImage = () => {
    setModalImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevModalImage = () => {
    setModalImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl mb-2">{property.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-5 h-5" />
                  <span>{property.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span>{property.rating}</span>
                  <span>({property.reviews} avis)</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {property.price.toLocaleString('fr-FR')} FCFA
              </div>
              <div className="text-muted-foreground">par nuit</div>
            </div>
          </div>

          <div className="inline-block px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full">
            {property.type === 'hotel' ? 'Hôtel' : 
             property.type === 'house' ? 'Maison' : 
             property.type === 'villa' ? 'Villa' : 'Appartement'}
          </div>
        </div>

        {/* Images Gallery */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-12">
          {/* Main Image Display */}
          <div className="relative h-96 rounded-xl overflow-hidden mb-4 group">
            <img
              src={property.images[currentImageIndex]}
              alt={`${property.title} ${currentImageIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => openImageModal(currentImageIndex)}
            />
            
            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm">
              {currentImageIndex + 1} / {property.images.length}
            </div>

            {/* Click to enlarge indicator */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Cliquez pour agrandir
            </div>
          </div>

          {/* Thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  currentImageIndex === index
                    ? 'border-primary shadow-lg shadow-primary/50'
                    : 'border-border hover:border-secondary'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Informations sur la propriété</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-input-background rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Voyageurs</div>
                    <div>{property.guests}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-input-background rounded-xl">
                  <BedDouble className="w-6 h-6 text-secondary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Chambres</div>
                    <div>{property.beds}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-input-background rounded-xl">
                  <Bath className="w-6 h-6 text-accent" />
                  <div>
                    <div className="text-sm text-muted-foreground">Salles de bain</div>
                    <div>{property.baths}</div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Wind;
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 bg-input-background rounded-xl">
                      <Icon className="w-5 h-5 text-primary" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl mb-4">Réserver maintenant</h3>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date d'arrivée
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Nombre de voyageurs
                  </label>
                  <input
                    type="number"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                    min="1"
                    max={property.guests}
                    required
                    className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {nights > 0 && (
                  <div className="border-t border-border pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{property.price.toLocaleString('fr-FR')} FCFA × {nights} nuits</span>
                      <span>{(property.price * nights).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frais de service</span>
                      <span>{Math.round(property.price * nights * 0.1).toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {Math.round(property.price * nights * 1.1).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
                >
                  Réserver
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl mb-2">Réservation Confirmée !</h3>
              <p className="text-muted-foreground mb-6">
                Votre réservation pour {property.title} a été enregistrée avec succès.
              </p>
              
              <div className="bg-input-background rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Arrivée:</span>
                  <span>{new Date(checkIn).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Départ:</span>
                  <span>{new Date(checkOut).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voyageurs:</span>
                  <span>{guests} personnes</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {Math.round(property.price * nights * 1.1).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowBookingModal(false);
                  navigate('/');
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Button */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevModalImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={nextModalImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img
              src={property.images[modalImageIndex]}
              alt={`${property.title} ${modalImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white">
            {modalImageIndex + 1} / {property.images.length}
          </div>

          {/* Thumbnails Navigation */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 bg-white/5 backdrop-blur-md rounded-full">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setModalImageIndex(index)}
                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  modalImageIndex === index
                    ? 'border-primary shadow-lg shadow-primary/50 scale-110'
                    : 'border-white/20 hover:border-white/50'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}