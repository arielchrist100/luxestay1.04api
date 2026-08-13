import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';

interface OwnerGuardProps {
  children: ReactNode;
}

/**
 * Composant de protection pour les routes propriétaires
 * Redirige vers la page de connexion si l'utilisateur n'est pas connecté
 * Affiche un message d'erreur si l'utilisateur n'est pas propriétaire
 */
export function OwnerGuard({ children }: OwnerGuardProps) {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est propriétaire ou admin
  const isOwner = user?.role === 'proprietaire' || user?.role === 'admin';

  useEffect(() => {
    if (!loading && !user) {
      // L'utilisateur n'est pas connecté, redirection vers login
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  // Affichage du loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    );
  }

  // L'utilisateur n'est pas connecté
  if (!user) {
    return null; // La redirection se fera via useEffect
  }

  // L'utilisateur est connecté mais n'a pas le rôle propriétaire
  if (!isOwner) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="backdrop-blur-xl bg-card/50 border border-border rounded-2xl p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-3xl mb-4">Accès Refusé</h1>
            <p className="text-muted-foreground mb-6">
              Vous devez être enregistré comme propriétaire pour accéder à cette section.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/owner/register')}
                className="w-full px-6 py-3 bg-gradient-to-r from-accent to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Devenir Propriétaire
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full px-6 py-3 bg-card border border-border text-foreground rounded-xl hover:bg-muted transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // L'utilisateur a accès, on affiche le contenu
  return <>{children}</>;
}
