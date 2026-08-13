import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token) {
      // Stocker le token
      localStorage.setItem('auth_token', token);

      // Rediriger vers l'accueil après un court délai
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Recharger pour mettre à jour le contexte
      }, 1500);
    } else if (error) {
      // Rediriger vers login avec le message d'erreur
      setTimeout(() => {
        navigate(`/login?error=${error}`);
      }, 2000);
    } else {
      // Pas de token ni d'erreur, rediriger vers login
      navigate('/login');
    }
  }, [navigate]);

  const params = new URLSearchParams(window.location.search);
  const hasToken = params.has('token');
  const hasError = params.has('error');

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {hasToken ? (
          <>
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Connexion Réussie !
            </h2>
            <p className="text-muted-foreground">
              Redirection en cours...
            </p>
          </>
        ) : hasError ? (
          <>
            <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-3xl mb-4 text-destructive">
              Erreur de Connexion
            </h2>
            <p className="text-muted-foreground mb-6">
              Une erreur s'est produite lors de la connexion sociale.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirection vers la page de connexion...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-muted-foreground">
              Traitement en cours...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
