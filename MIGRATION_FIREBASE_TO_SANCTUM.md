# 🔄 Migration Firebase → Laravel Sanctum

Ce guide explique comment migrer de Firebase Authentication vers Laravel Sanctum.

## 📊 Comparaison

| Fonctionnalité | Firebase Auth | Laravel Sanctum |
|----------------|---------------|-----------------|
| **Setup** | Rapide, cloud | Requiert serveur Laravel |
| **Tokens** | JWT (vérification via Firebase Admin) | API tokens simples |
| **Social Login** | Intégré (Google, Facebook) | Via Laravel Socialite |
| **Base de données** | Firestore/Realtime DB | MySQL/PostgreSQL |
| **Coût** | Gratuit jusqu'à 10k users/mois | Serveur + BDD |
| **Contrôle** | Limité | Total |
| **Complexité** | Faible | Moyenne |

## 🎯 Pourquoi migrer ?

### ✅ Avantages Sanctum

1. **Contrôle total** : Toute la logique d'auth dans votre code
2. **Données centralisées** : Tout dans MySQL (users + propriétés + réservations)
3. **Simplicité** : Pas de SDK externe, juste Laravel
4. **Personnalisable** : Modifier facilement la logique d'auth
5. **Performance** : Pas d'appel externe pour vérifier les tokens

### ❌ Inconvénients

1. **Serveur requis** : Besoin d'héberger Laravel
2. **Setup plus long** : Configuration OAuth manuelle
3. **Maintenance** : Gérer le serveur + la BDD

## 🚀 Migration Step by Step

### Étape 1 : Setup Laravel Sanctum (Backend)

Suivre le guide complet dans `LARAVEL_SANCTUM_GUIDE.md`

### Étape 2 : Créer les utilisateurs depuis Firebase

```php
// Script de migration (une fois)
// app/Console/Commands/MigrateFirebaseUsers.php

use Kreait\Firebase\Factory;
use App\Models\User;

$firebase = (new Factory)->withServiceAccount(storage_path('firebase.json'));
$auth = $firebase->createAuth();

foreach ($auth->listUsers() as $firebaseUser) {
    User::updateOrCreate(
        ['email' => $firebaseUser->email],
        [
            'name' => $firebaseUser->displayName,
            'email' => $firebaseUser->email,
            'provider' => 'firebase',
            'provider_id' => $firebaseUser->uid,
            'avatar' => $firebaseUser->photoUrl,
            'password' => Hash::make(uniqid()), // Mot de passe aléatoire
        ]
    );
}
```

### Étape 3 : Adapter le Frontend

#### A. Remplacer les imports

**Avant (Firebase)** :
```typescript
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
```

**Après (Sanctum)** :
```typescript
import { sanctumApi } from '../services/sanctumApi';
```

#### B. Adapter le Login

**Avant (Firebase)** :
```typescript
const handleLogin = async () => {
  await signInWithEmailAndPassword(auth, email, password);
  // Le UserContext gère le reste
};
```

**Après (Sanctum)** :
```typescript
const handleLogin = async () => {
  const { token, user } = await sanctumApi.login({ email, password });
  localStorage.setItem('auth_token', token);
  // Rediriger ou mettre à jour le contexte
};
```

#### C. Adapter le Signup

**Avant (Firebase)** :
```typescript
const handleSignup = async () => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await apiService.syncUser({ ... }); // Sync avec Laravel
};
```

**Après (Sanctum)** :
```typescript
const handleSignup = async () => {
  const { token, user } = await sanctumApi.signup({
    name: `${firstName} ${lastName}`,
    email,
    password,
  });
  localStorage.setItem('auth_token', token);
};
```

#### D. Adapter le Social Login

**Avant (Firebase)** :
```typescript
const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};
```

**Après (Sanctum)** :
```typescript
const handleGoogleLogin = () => {
  // Redirection vers Laravel
  sanctumApi.socialLogin('google');
  // Laravel redirige vers /auth/callback?token=...
};
```

### Étape 4 : Adapter le UserContext

**Option 1 : Double système (Firebase + Sanctum)**

```typescript
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authMethod, setAuthMethod] = useState<'firebase' | 'sanctum'>('firebase');

  useEffect(() => {
    // Vérifier le token Sanctum
    if (sanctumApi.isAuthenticated()) {
      setAuthMethod('sanctum');
      loadSanctumUser();
    } else {
      // Fallback sur Firebase
      setAuthMethod('firebase');
      const unsubscribe = auth.onAuthStateChanged(loadFirebaseUser);
      return unsubscribe;
    }
  }, []);

  const loadSanctumUser = async () => {
    const { user } = await sanctumApi.getUser();
    setUser(user);
  };

  const loadFirebaseUser = async (firebaseUser) => {
    // Logique existante
  };
}
```

**Option 2 : Migration complète (Sanctum uniquement)**

```typescript
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (sanctumApi.isAuthenticated()) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const { user } = await sanctumApi.getUser();
      setUser(user);
    } catch (error) {
      localStorage.removeItem('auth_token');
    }
  };

  const login = async (email: string, password: string) => {
    const { token, user } = await sanctumApi.login({ email, password });
    localStorage.setItem('auth_token', token);
    setUser(user);
  };

  const logout = async () => {
    await sanctumApi.logout();
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
```

### Étape 5 : Tester

```bash
# Backend
php artisan serve

# Frontend
npm run dev

# Tests
# 1. Signup email/password
# 2. Login email/password
# 3. Social login Google
# 4. Social login Facebook
# 5. Logout
# 6. Refresh page (token persisté)
```

## 📋 Checklist Migration

### Préparation
- [ ] Laravel Sanctum installé et configuré
- [ ] MySQL configuré
- [ ] Google OAuth configuré (Console Cloud)
- [ ] Facebook OAuth configuré (App Facebook)
- [ ] Script de migration des users Firebase → MySQL exécuté

### Frontend
- [ ] Service `sanctumApi.ts` créé
- [ ] Login adapté (utilise `sanctumApi.login`)
- [ ] Signup adapté (utilise `sanctumApi.signup`)
- [ ] Social login adapté (redirections)
- [ ] Page `/auth/callback` créée
- [ ] UserContext adapté
- [ ] Tests réussis

### Backend
- [ ] AuthController créé
- [ ] Routes API configurées
- [ ] CORS configuré
- [ ] Socialite configuré
- [ ] Tests API réussis (Postman/Insomnia)

## 🎯 Stratégie recommandée

### Phase 1 : Coexistence (Recommandé)
1. Garder Firebase Auth actif
2. Ajouter Sanctum en parallèle
3. Permettre aux nouveaux users de choisir
4. Migrer progressivement les anciens users

### Phase 2 : Migration forcée
1. Annoncer la migration aux utilisateurs
2. Envoyer un email de réinitialisation de mot de passe
3. Migrer tous les comptes Firebase → Sanctum
4. Désactiver Firebase Auth

### Phase 3 : Sanctum uniquement
1. Retirer le code Firebase du frontend
2. Retirer Firebase Admin SDK du backend
3. Nettoyer les dépendances

## ⚠️ Points d'attention

1. **Mots de passe** : Firebase ne permet pas d'exporter les mots de passe hashés
   - Solution : Forcer une réinitialisation pour tous les users

2. **Sessions actives** : Les tokens Firebase ne fonctionneront plus
   - Solution : Déconnecter tous les users lors de la migration

3. **Social login** : Reconfigurer les redirect URIs
   - Google Console : Ajouter `http://localhost:8000/api/auth/google/callback`
   - Facebook App : Ajouter `http://localhost:8000/api/auth/facebook/callback`

4. **Rôles** : Migrer les custom claims Firebase → colonne `role` MySQL
   ```php
   // Dans le script de migration
   $customClaims = $firebaseUser->customClaims;
   $role = $customClaims['role'] ?? 'client';
   ```

## 💡 Conseil final

**Ne pas tout migrer d'un coup !**

1. Commencez par ajouter Sanctum en parallèle de Firebase
2. Testez avec quelques users beta
3. Migrez progressivement
4. Gardez Firebase en backup pendant 1-2 mois
5. Désactivez Firebase seulement quand vous êtes sûr

---

**Durée estimée de migration** : 2-3 jours pour un projet de taille moyenne
