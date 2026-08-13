import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Users, Baby, MessageSquare, Loader2, X, Calendar, MapPin, Moon } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { auth } from '../config/firebase';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface BookingState {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  pricePerNight: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export function Reservation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, firebaseUser } = useUser();
  const state = location.state as BookingState | null;

  const [phone, setPhone] = useState(user?.phone || '');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [specialRequest, setSpecialRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Aucune réservation en cours.</p>
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

  if (!firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-muted-foreground">Vous devez être connecté pour réserver.</p>
          <button
            onClick={() => navigate('/login', { state: { from: '/reservation', bookingState: state } })}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Le numéro de téléphone est requis pour vous contacter.');
      return;
    }

    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();

      const payload = {
        hotelId: state.propertyId,
        firebaseUid: firebaseUser.uid,
        phone: phone.trim(),
        checkIn: state.checkIn,
        checkOut: state.checkOut,
        nights: state.nights,
        adults,
        children,
        specialRequest: specialRequest.trim(),
        amount: state.total,
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la réservation.');
      }

      // Naviguer vers la page de paiement avec les infos retournées par le backend
      navigate('/payment', {
        state: {
          bookingId: data.bookingId,
          propertyTitle: state.propertyTitle,
          propertyImage: state.propertyImage,
          checkIn: state.checkIn,
          checkOut: state.checkOut,
          nights: state.nights,
          total: state.total,
          clientFirstName: user?.firstName || firebaseUser.displayName?.split(' ')[0] || '',
          clientLastName: user?.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          clientEmail: firebaseUser.email || '',
          clientPhone: phone.trim(),
        },
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : firebaseUser.displayName || '';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <h1 className="text-3xl mb-8">Finaliser la réservation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Récapitulatif logement */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Récapitulatif</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <img
                src={state.propertyImage}
                alt={state.propertyTitle}
                className="w-full h-40 object-cover"
              />
              <div className="p-4 space-y-3">
                <p className="font-semibold">{state.propertyTitle}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {state.propertyLocation}
                </div>

                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-3 h-3" /> Arrivée</span>
                    <span>{new Date(state.checkIn).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="w-3 h-3" /> Départ</span>
                    <span>{new Date(state.checkOut).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground"><Moon className="w-3 h-3" /> Nuits</span>
                    <span>{state.nights}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{state.pricePerNight.toLocaleString('fr-FR')} FCFA × {state.nights} nuits</span>
                    <span>{state.subtotal.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frais de service</span>
                    <span>{state.serviceFee.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border font-semibold">
                    <span>Total</span>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {state.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Identité Firebase (lecture seule) */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2 text-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Votre profil</p>
              <div className="flex items-center gap-3">
                {firebaseUser.photoURL ? (
                  <img src={firebaseUser.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-medium">{displayName}</p>
                  <p className="text-muted-foreground text-xs">{firebaseUser.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informations de réservation</h2>

            {/* Téléphone */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Numéro de téléphone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+225 07 00 00 00 00"
                  className="w-full pl-10 pr-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Utilisé pour le paiement et vous contacter.</p>
            </div>

            {/* Adultes + Enfants */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Adultes *
                </label>
                <input
                  type="number"
                  value={adults}
                  onChange={(e) => setAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                  className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  <Baby className="w-4 h-4 inline mr-1" />
                  Enfants
                </label>
                <input
                  type="number"
                  value={children}
                  onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Demandes spéciales */}
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Demandes spéciales <span className="text-xs">(optionnel)</span>
              </label>
              <textarea
                value={specialRequest}
                onChange={(e) => setSpecialRequest(e.target.value)}
                rows={3}
                placeholder="Chambre calme, étage élevé, lit bébé..."
                className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                <X className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                `Continuer vers le paiement — ${state.total.toLocaleString('fr-FR')} FCFA`
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Votre réservation sera confirmée après le paiement via CinetPay.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
