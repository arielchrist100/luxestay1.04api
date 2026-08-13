import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, X, CheckCircle, Calendar, Moon } from 'lucide-react';
import { auth } from '../config/firebase';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export interface PaymentRouteState {
  bookingId: string;
  propertyTitle: string;
  propertyImage: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
}

export function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as PaymentRouteState | null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // CinetPay renvoie ?transaction_id=xxx&status=ACCEPTED sur la page de retour
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id');
    const status = params.get('status');

    if (transactionId && status === 'ACCEPTED') {
      setSuccess(true);
    } else if (transactionId && status) {
      setError(`Paiement non abouti (statut : ${status}). Veuillez réessayer.`);
    }
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Session de paiement expirée.</p>
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

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch(`${API_URL}/api/payments/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: state.bookingId,
          amount: state.total,
          currency: 'XOF',
          description: `Réservation — ${state.propertyTitle}`,
          // CinetPay redirect URLs (à configurer dans votre .env)
          returnUrl: `${window.location.origin}/payment?booking_id=${state.bookingId}`,
          notifyUrl: `${API_URL}/api/payments/notify`,
          clientName: `${state.clientFirstName} ${state.clientLastName}`,
          clientEmail: state.clientEmail,
          clientPhone: state.clientPhone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Impossible d\'initialiser le paiement.');
      }

      // Le backend renvoie l'URL de paiement CinetPay
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl mb-2">Paiement confirmé !</h2>
            <p className="text-muted-foreground">
              Votre réservation pour <span className="text-foreground font-medium">{state.propertyTitle}</span> est confirmée.
              Vous recevrez une confirmation par email.
            </p>
          </div>
          <div className="bg-input-background rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Réservation n°</span>
              <span className="font-mono text-xs">{state.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Arrivée</span>
              <span>{new Date(state.checkIn).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Départ</span>
              <span>{new Date(state.checkOut).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold">
              <span className="text-muted-foreground">Montant payé</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {state.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <h1 className="text-3xl mb-2">Paiement</h1>
        <p className="text-muted-foreground mb-8">Sécurisé par CinetPay</p>

        {/* Récap commande */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
          <img
            src={state.propertyImage}
            alt={state.propertyTitle}
            className="w-full h-36 object-cover"
          />
          <div className="p-4 space-y-3">
            <p className="font-semibold">{state.propertyTitle}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(state.checkIn).toLocaleDateString('fr-FR')} → {new Date(state.checkOut).toLocaleDateString('fr-FR')}
              </span>
              <span className="flex items-center gap-1">
                <Moon className="w-3 h-3" />
                {state.nights} nuit{state.nights > 1 ? 's' : ''}
              </span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Total à payer</span>
              <span className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold">
                {state.total.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* Infos client */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 space-y-2 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Facturation</p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nom</span>
            <span>{state.clientFirstName} {state.clientLastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{state.clientEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Téléphone</span>
            <span>{state.clientPhone}</span>
          </div>
        </div>

        {/* Moyens de paiement CinetPay */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Moyens de paiement acceptés</p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
            {[
              { logo: '🟠', label: 'Orange Money' },
              { logo: '🟡', label: 'MTN Money' },
              { logo: '🔵', label: 'Moov Money' },
              { logo: '🌊', label: 'Wave' },
            ].map(opt => (
              <div key={opt.label} className="flex flex-col items-center gap-1 p-2 bg-input-background rounded-xl">
                <span className="text-2xl">{opt.logo}</span>
                <span className="leading-tight">{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm mb-4">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 font-semibold text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redirection vers CinetPay...
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5" />
              Payer {state.total.toLocaleString('fr-FR')} FCFA
            </>
          )}
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Paiement 100% sécurisé via CinetPay
        </p>
      </div>
    </div>
  );
}