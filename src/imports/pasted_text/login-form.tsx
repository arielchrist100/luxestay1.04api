import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useUser } from '../context/UserContext';

export function Login() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Effacer l'erreur lors de la saisie
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Récupérer l'utilisateur enregistré depuis localStorage
    const storedUser = localStorage.getItem('currentUser');
    
    if (!storedUser) {
      setError('Aucun compte trouvé. Veuillez vous inscrire d\'abord.');
      return;
    }

    const userData = JSON.parse(storedUser);

    // Vérifier l'email et le mot de passe
    // Note: Dans un vrai système, le mot de passe serait hashé et vérifié côté serveur
    const storedPassword = localStorage.getItem('userPassword');
    
    if (userData.email !== formData.email) {
      setError('Email incorrect');
      return;
    }

    if (storedPassword !== formData.password) {
      setError('Mot de passe incorrect');
      return;
    }

    // Connexion réussie
    login(userData);
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Connexion
          </h1>
          <p className="text-muted-foreground text-lg">
            Connectez-vous à votre compte LuxeStay
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-xl">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="votre.email@exemple.com"
              className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-muted-foreground mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Votre mot de passe"
              className="w-full px-4 py-3 bg-input-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => alert('Fonctionnalité de récupération de mot de passe à venir')}
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity text-lg flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Se connecter</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-card text-muted-foreground">OU</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas encore de compte ?
            </p>
            <Link
              to="/signup"
              className="inline-block px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
