import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building2, FileText, Phone, MapPin, User, CheckCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { apiService } from '../services/api';

export function OwnerRegister() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    address: '',
    identityDocument: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.phone || '',
      }));
      checkRequestStatus();
    }
  }, [user]);

  const checkRequestStatus = async () => {
    try {
      const response = await apiService.checkOwnerRequestStatus();
      if (response.hasRequest) {
        setRequestStatus(response.request);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.registerAsOwner({
        companyName: formData.companyName || undefined,
        phone: formData.phone,
        address: formData.address || undefined,
        identityDocument: formData.identityDocument || undefined,
      });

      setSuccess(true);
      await checkRequestStatus();
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      setError(err.response?.data?.error || err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Si la demande est déjà approuvée
  if (requestStatus?.status === 'approved') {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-4">Demande Approuvée !</h1>
          <p className="text-muted-foreground mb-8">
            Votre demande a été approuvée. Vous pouvez maintenant accéder au dashboard propriétaire.
          </p>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            Accéder au Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Si la demande est en attente
  if (requestStatus?.status === 'pending') {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-4">Demande En Attente</h1>
          <p className="text-muted-foreground mb-8">
            Votre demande pour devenir propriétaire est en cours d'examen. Nous vous contacterons bientôt.
          </p>
          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-xl p-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut :</span>
                <span className="text-yellow-500 font-medium">En attente</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date :</span>
                <span>{new Date(requestStatus.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-6 px-8 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  // Si la demande a été rejetée
  if (requestStatus?.status === 'rejected') {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-4">Demande Rejetée</h1>
          <p className="text-muted-foreground mb-8">
            Votre demande a été rejetée.
          </p>
          {requestStatus.adminNote && (
            <div className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 rounded-xl p-4 text-destructive mb-6">
              <p className="text-sm">{requestStatus.adminNote}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-card border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-accent to-secondary bg-clip-text text-transparent">
              Devenez Propriétaire
            </h1>
            <p className="text-muted-foreground text-lg">
              Soumettez votre demande pour devenir propriétaire sur notre plateforme
            </p>
          </div>

          {error && (
            <div className="backdrop-blur-xl bg-destructive/10 border border-destructive/50 rounded-xl p-4 text-destructive mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="backdrop-blur-xl bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-green-600 mb-6">
              Votre demande a été envoyée avec succès ! Elle sera examinée par notre équipe.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations utilisateur */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-xl p-6">
              <h2 className="text-2xl mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Vos Informations
              </h2>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom :</span>
                    <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email :</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations de la demande */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-secondary" />
                Détails de la Demande
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Nom de l'entreprise (optionnel)
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="Ma Société SARL"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Téléphone de contact *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Adresse (optionnel)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors resize-none"
                      placeholder="123 Rue de la Propriété, 75000 Paris, France"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Pièce d'identité (URL ou lien) (optionnel)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="identityDocument"
                      value={formData.identityDocument}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="https://example.com/documents/id.pdf"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Vous pouvez fournir un lien vers votre pièce d'identité (Google Drive, Dropbox, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Info importante */}
            <div className="backdrop-blur-xl bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
              <p className="text-sm text-blue-600">
                ℹ️ Votre demande sera examinée par notre équipe. Vous recevrez une notification une fois qu'elle sera approuvée ou rejetée.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <motion.button
                type="submit"
                disabled={loading || success}
                whileHover={{ scale: loading || success ? 1 : 1.02 }}
                whileTap={{ scale: loading || success ? 1 : 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Envoi en cours...' : success ? 'Demande envoyée ✓' : 'Soumettre ma demande'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
