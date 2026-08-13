import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { apiService } from '../services/api';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'admin' | 'proprietaire' | 'client';
  idPhoto?: string;
}

interface UserContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Écouter les changements d'authentification Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser && firebaseUser.email) {
        console.log('🔥 Utilisateur Firebase connecté:', firebaseUser.email);

        // Créer les données utilisateur depuis Firebase
        const names = firebaseUser.displayName?.split(' ') || [];
        // Si pas de displayName, utiliser la partie avant @ de l'email
        const firstName = names[0] || firebaseUser.email.split('@')[0] || 'Utilisateur';
        const lastName = names.slice(1).join(' ') || '';

        const userData: User = {
          email: firebaseUser.email,
          firstName: firstName,
          lastName: lastName,
          phone: firebaseUser.phoneNumber || '',
          idPhoto: firebaseUser.photoURL || undefined,
          role: 'client', // Par défaut
        };

        // Sauvegarder temporairement
        setUser(userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));

        // ✅ SYNCHRONISER AUTOMATIQUEMENT avec MySQL
        try {
          console.log('📡 Synchronisation avec le backend MySQL...');
          const response = await apiService.syncUser({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            idPhoto: userData.idPhoto,
          });

          if (response.user) {
            console.log('✅ Synchronisation réussie ! Rôle:', response.user.role);
            // Mettre à jour avec les données du backend (avec le vrai rôle)
            setUser(response.user);
            localStorage.setItem('currentUser', JSON.stringify(response.user));
          }
        } catch (error) {
          console.error('❌ Erreur lors de la synchronisation avec MySQL:', error);
          // Continuer quand même avec les données Firebase
        }
      } else {
        // Utilisateur déconnecté
        console.log('👋 Utilisateur déconnecté');
        setUser(null);
        localStorage.removeItem('currentUser');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Synchronise les données utilisateur avec le backend Laravel
   */
  const syncWithBackend = async () => {
    try {
      if (!user) {
        console.warn('⚠️ Pas d\'utilisateur à synchroniser');
        return;
      }

      console.log('📡 Synchronisation manuelle avec le backend...');
      const response = await apiService.syncUser({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        idPhoto: user.idPhoto,
      });

      if (response.user) {
        console.log('✅ Synchronisation manuelle réussie ! Rôle:', response.user.role);
        setUser(response.user);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation avec le backend:', error);
    }
  };

  /**
   * Déconnexion
   */
  const logout = async () => {
    try {
      console.log('👋 Déconnexion...');
      await auth.signOut();
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      firebaseUser,
      loading,
      setUser,
      logout,
      syncWithBackend,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
