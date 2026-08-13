import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Composant exemple : afficher le profil de l'utilisateur connecté
 * Récupère les données depuis localStorage
 */
export function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erreur lors de la lecture de l\'utilisateur:', error);
        localStorage.removeItem('user');
        navigate('/login-laravel');
      }
    } else {
      // Pas d'utilisateur connecté
      navigate('/login-laravel');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login-laravel');
  };

  if (!user) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Mon Profil</h2>

      <div style={{
        background: '#f8f9fa',
        padding: 20,
        borderRadius: 10,
        marginTop: 20,
      }}>
        <div style={{ marginBottom: 15 }}>
          <strong>ID :</strong> {user.id}
        </div>

        <div style={{ marginBottom: 15 }}>
          <strong>Nom :</strong> {user.name}
        </div>

        <div style={{ marginBottom: 15 }}>
          <strong>Email :</strong> {user.email}
        </div>

        {user.phone && (
          <div style={{ marginBottom: 15 }}>
            <strong>Téléphone :</strong> {user.phone}
          </div>
        )}

        <div style={{ marginBottom: 15 }}>
          <strong>Rôle :</strong>{' '}
          <span style={{
            padding: '4px 12px',
            background: user.role === 'admin' ? '#28a745' :
                       user.role === 'proprietaire' ? '#007bff' : '#6c757d',
            color: 'white',
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 'bold',
          }}>
            {user.role || 'client'}
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        style={{
          marginTop: 20,
          padding: '12px 20px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 'bold',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Déconnexion
      </button>
    </div>
  );
}
