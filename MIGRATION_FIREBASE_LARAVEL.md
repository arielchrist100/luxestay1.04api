# ✅ Migration Terminée : Firebase + Laravel

## 🎉 Ce qui a été fait

Votre application utilise maintenant **Firebase pour l'authentification** et **Laravel pour stocker les données**.

### ✅ Frontend modifié

1. **`src/app/services/api.ts`**
   - Récupère le token Firebase avec `auth.currentUser.getIdToken()`
   - Envoie le token dans l'en-tête : `Authorization: Bearer {firebase_token}`

2. **`src/app/context/UserContext.tsx`** (NOUVEAU)
   - Écoute Firebase Auth avec `onAuthStateChanged`
   - Synchronise automatiquement avec Laravel
   - Méthode `syncWithBackend()` pour envoyer les données

3. **`src/app/App.tsx`**
   - Utilise `<UserProvider>` au lieu de `<AuthProvider>`

4. **`src/app/components/Navbar.tsx`**
   - Utilise `useUser()` au lieu de `useAuth()`
   - Affiche `firstName`, `lastName`, `idPhoto`

5. **`src/app/pages/OwnerRegister.tsx`**
   - Utilise `syncWithBackend()` pour synchroniser avec Laravel
   - Appelle `apiService.registerAsOwner()` avec le token Firebase

6. **`src/app/components/OwnerGuard.tsx`**
   - Utilise `useUser()` au lieu de `useAuth()`

---

## 🔥 Comment ça fonctionne

### Flux d'authentification

```
1. User se connecte avec Firebase (email/password, Google, Facebook)
   ↓
2. Firebase retourne un token ID
   ↓
3. Frontend envoie le token à Laravel : GET /api/auth/verify
   ↓
4. Laravel vérifie le token avec Firebase Admin SDK
   ↓
5. Laravel extrait le firebase_uid
   ↓
6. Laravel cherche ou crée l'utilisateur dans MySQL
   ↓
7. Laravel retourne les données user
```

### Exemple de requête

**Frontend** :
```typescript
const token = await auth.currentUser.getIdToken();

fetch('http://localhost:8000/api/auth/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'jean@example.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+33612345678'
  })
});
```

**Laravel** :
```php
// Middleware récupère le token
$token = $request->bearerToken();

// Firebase Admin SDK vérifie le token
$verifiedIdToken = $firebase->verifyIdToken($token);
$firebase_uid = $verifiedIdToken->claims()->get('sub');

// Créer ou mettre à jour l'utilisateur
$user = User::updateOrCreate(
    ['firebase_uid' => $firebase_uid],
    [
        'email' => $request->email,
        'firstName' => $request->firstName,
        'lastName' => $request->lastName,
        'phone' => $request->phone,
    ]
);
```

---

## 📋 Installation Backend Laravel

Suivez le guide complet : **`FIREBASE_LARAVEL_SETUP.md`**

### Résumé rapide

1. **Installer Laravel** :
   ```bash
   composer create-project laravel/laravel backend
   cd backend
   ```

2. **Installer Firebase Admin SDK** :
   ```bash
   composer require kreait/firebase-php
   ```

3. **Télécharger les credentials Firebase** :
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Placer dans `storage/app/firebase-credentials.json`

4. **Créer les migrations** :
   ```bash
   php artisan migrate
   ```

5. **Créer les controllers** :
   - `AuthController` → vérifie token, synchronise user
   - `OwnerController` → enregistre comme propriétaire

6. **Démarrer le serveur** :
   ```bash
   php artisan serve
   ```

---

## 🧪 Tests

### 1. Se connecter avec Firebase

1. Aller sur `http://localhost:5173/login`
2. Se connecter avec email/password
3. Vérifier dans la console (F12) :
   ```javascript
   console.log(localStorage.getItem('currentUser'));
   ```

### 2. Vérifier la synchronisation Laravel

1. Ouvrir MySQL :
   ```bash
   mysql -u root -p luxestay
   SELECT * FROM users;
   ```
2. Vous devriez voir votre utilisateur avec `firebase_uid`

### 3. Tester l'inscription propriétaire

1. Aller sur `/owner/register`
2. Remplir le formulaire
3. Soumettre
4. Vérifier que le rôle change en "proprietaire" :
   ```bash
   SELECT firebase_uid, email, firstName, lastName, role FROM users;
   ```

---

## 📁 Structure des données

### Frontend (UserContext)

```typescript
{
  id?: number;
  firebase_uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'admin' | 'proprietaire' | 'client';
  idPhoto?: string;
}
```

### Backend (MySQL)

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    idPhoto VARCHAR(500),
    role ENUM('admin', 'proprietaire', 'client') DEFAULT 'client',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔐 Sécurité

### ✅ Ce qui est sécurisé

- Token Firebase vérifié côté serveur
- Middleware protège toutes les routes API
- Firebase Admin SDK valide les signatures
- Token expiré = erreur 401

### ⚠️ À NE JAMAIS FAIRE

- ❌ Commiter `firebase-credentials.json` sur Git
- ❌ Exposer les credentials Firebase dans le code frontend
- ❌ Faire confiance au token sans vérification backend

---

## 📚 Fichiers de documentation

1. **`FIREBASE_LARAVEL_SETUP.md`** → Guide complet backend Laravel
2. **`MIGRATION_FIREBASE_LARAVEL.md`** → Ce fichier (résumé)
3. **`database.sql`** → Structure complète MySQL

---

## 🎯 Prochaines étapes

1. **Configurer le backend Laravel** (suivre `FIREBASE_LARAVEL_SETUP.md`)
2. **Tester l'authentification**
3. **Créer la table `properties`** pour les propriétés
4. **Implémenter le dashboard propriétaire**
5. **Ajouter les réservations (bookings)**

---

## ❓ En cas de problème

### Erreur "Token invalide"

- Vérifier que Firebase est correctement initialisé
- Vérifier que `firebase-credentials.json` est bien placé
- Vérifier que le token est bien envoyé : `Authorization: Bearer {token}`

### Erreur CORS

- Vérifier `config/cors.php` dans Laravel
- Ajouter `FRONTEND_URL=http://localhost:5173` dans `.env`

### L'utilisateur n'est pas synchronisé

- Vérifier dans la console (F12) les requêtes réseau
- Vérifier que `/api/auth/sync` retourne 200
- Vérifier dans MySQL : `SELECT * FROM users;`

---

**Votre application est maintenant 100% Firebase + Laravel !** 🎉
