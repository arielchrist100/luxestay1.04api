import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, Mail, Phone, Camera, Save, ArrowLeft } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { auth } from '../config/firebase';
import { updateProfile, updateEmail } from 'firebase/auth';

export function Profile() {
  const navigate = useNavigate();
  const { user, firebaseUser, loading: contextLoading, setUser, syncWithBackend } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idPhoto: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        idPhoto: user.idPhoto || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!firebaseUser) {
        setError('Utilisateur non connecté');
        return;
      }

      // Mettre à jour le profil Firebase
      await updateProfile(firebaseUser, {
        displayName: `${formData.firstName} ${formData.lastName}`,
        photoURL: formData.idPhoto || null,
      });

      // Mettre à jour l'email si changé
      if (formData.email !== firebaseUser.email) {
        await updateEmail(firebaseUser, formData.email);
      }

      // Mettre à jour le localStorage
      const updatedUser = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        idPhoto: formData.idPhoto,
        role: user?.role || 'client',
      };

      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Synchroniser avec le backend Laravel
      await syncWithBackend();

      setSuccess('Profil mis à jour avec succès !');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('Pour changer votre email, vous devez vous reconnecter');
      } else {
        setError(err.message || 'Une erreur est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && !contextLoading) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-primary">
                {formData.idPhoto ? (
                  <img
                    src={formData.idPhoto}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <h1 className="text-4xl mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Mon Profil
            </h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/50 rounded-xl text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/50 rounded-xl text-primary">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom complet */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4">Informations personnelles</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="Jean"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Avatar URL (optionnel) */}
            <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4">Photo de profil</h2>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  <Camera className="w-4 h-4 inline mr-1" />
                  URL de l'image
                </label>
                <input
                  type="url"
                  name="idPhoto"
                  value={formData.idPhoto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary transition-colors"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Ou utilisez la photo de votre compte Google/Facebook
                </p>
              </div>
            </div>

            {/* Informations du compte */}
            {user && (
              <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-6">
                <h2 className="text-xl mb-4">Informations du compte</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rôle :</span>
                    <span className="font-medium capitalize">{user.role || 'Client'}</span>
                  </div>
                  {firebaseUser && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Firebase :</span>
                      <span className="font-medium text-xs">{firebaseUser.uid.substring(0, 12)}...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bouton de sauvegarde */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
