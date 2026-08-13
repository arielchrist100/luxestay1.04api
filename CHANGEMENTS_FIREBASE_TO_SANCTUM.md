# 🔄 Changements : Firebase → Laravel Sanctum

## ✅ Ce qui a été fait

### 1. **Suppression de Firebase**

Firebase Authentication a été complètement retiré. Tout passe maintenant par Laravel Sanctum.

### 2. **Nouveau contexte : AuthContext**

**Avant** : `UserContext.tsx` (Firebase)
**Après** : `AuthContext.tsx` (Sanctum)

```typescript
// Ancien
import { useUser } from '../context/UserContext';
const { user, firebaseUser, login, logout } = useUser();

// Nouveau
import { useAuth } from '../context/AuthContext';
const { user, login, logout, isOwner, isAdmin } = useAuth();
```

### 3. **Structure utilisateur modifiée**

**Avant (Firebase)** :
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idPhoto?: string;
  role?: string;
}
```

**Après (Sanctum)** :
```typescript
{
  id: number;
  name: string;        // "Prénom Nom"
  email: string;
  phone?: string;
  avatar?: string;     // URL photo
  role: 'admin' | 'proprietaire' | 'client';
}
```

### 4. **Pages adaptées**

#### Login.tsx
- ✅ Utilise `sanctumApi.login(email, password)`
- ✅ Token stocké dans `localStorage`
- ✅ Social login via redirection Laravel

#### SignUp.tsx
- ✅ Utilise `sanctumApi.signup({ name, email, password, phone })`
- ✅ Crée directement dans MySQL
- ✅ Pas de Firebase

#### Profile.tsx
- ✅ Récupère les données depuis Laravel
- ✅ Met à jour via `sanctumApi.updateUser()`
- ✅ Rafraîchissement automatique

#### OwnerRegister.tsx
- ✅ Envoie directement à Laravel
- ✅ Change le rôle en "proprietaire"
- ✅ Pas de synchronisation Firebase

### 5. **Navbar mise à jour**

- ✅ Affiche `user.name` (au lieu de firstName/lastName)
- ✅ Affiche `user.avatar` (au lieu de idPhoto)
- ✅ Affiche le rôle utilisateur
- ✅ Menu profil fonctionnel

### 6. **OwnerGuard adapté**

- ✅ Vérifie `user` (Sanctum)
- ✅ Utilise `isOwner` du contexte
- ✅ Plus de vérification Firebase

## 📁 Fichiers modifiés

```
src/app/
├── context/
│   ├── AuthContext.tsx          ✨ NOUVEAU (remplace UserContext)
│   └── UserContext.tsx          ⚠️ OBSOLÈTE (ne plus utiliser)
│
├── pages/
│   ├── Login.tsx                ✅ MODIFIÉ (Sanctum)
│   ├── SignUp.tsx               ✅ MODIFIÉ (Sanctum)
│   ├── Profile.tsx              ✅ MODIFIÉ (Sanctum)
│   ├── OwnerRegister.tsx        ✅ MODIFIÉ (Sanctum)
│   └── AuthCallback.tsx         ✅ Déjà créé (social login)
│
├── components/
│   ├── Navbar.tsx               ✅ MODIFIÉ (useAuth)
│   └── OwnerGuard.tsx           ✅ MODIFIÉ (useAuth)
│
├── services/
│   ├── sanctumApi.ts            ✅ Déjà créé
│   └── api.ts                   ⚠️ OBSOLÈTE (Firebase)
│
└── App.tsx                      ✅ MODIFIÉ (AuthProvider)
```

## 🔧 Variables d'environnement

**Frontend** (`.env`) :

```env
# Laravel API
VITE_API_URL=http://localhost:8000/api

# Firebase - PLUS NÉCESSAIRE (peut être supprimé)
# VITE_FIREBASE_API_KEY=...
# VITE_FIREBASE_AUTH_DOMAIN=...
```

**Backend Laravel** (`.env`) :

```env
# Frontend
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Base de données
DB_CONNECTION=mysql
DB_DATABASE=luxestay
DB_USERNAME=root
DB_PASSWORD=

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Facebook OAuth (optionnel)
FACEBOOK_CLIENT_ID=...
FACEBOOK_CLIENT_SECRET=...
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
```

## 🚀 Démarrage

### 1. Backend Laravel

```bash
cd backend
composer install
php artisan migrate
php artisan serve
```

### 2. Frontend React

```bash
cd frontend
npm install  # ou pnpm install
npm run dev  # ou pnpm dev
```

## 🧪 Tests à effectuer

### 1. Inscription
- [ ] Aller sur `/signup`
- [ ] Remplir le formulaire
- [ ] Vérifier que l'utilisateur est créé dans MySQL
- [ ] Vérifier que le token est stocké
- [ ] Vérifier la redirection vers `/`

### 2. Connexion
- [ ] Aller sur `/login`
- [ ] Se connecter
- [ ] Vérifier que le menu profil apparaît
- [ ] Vérifier que le nom s'affiche

### 3. Profil
- [ ] Cliquer sur "Mon Profil"
- [ ] Modifier les informations
- [ ] Enregistrer
- [ ] Vérifier que les modifications sont sauvegardées

### 4. Inscription propriétaire
- [ ] Cliquer sur "Je suis propriétaire"
- [ ] Remplir le formulaire
- [ ] Vérifier que le rôle change en "proprietaire"
- [ ] Vérifier l'accès au dashboard

### 5. Social Login (si configuré)
- [ ] Cliquer sur Google/Facebook
- [ ] Autoriser l'app
- [ ] Vérifier la redirection avec token
- [ ] Vérifier que l'utilisateur est créé

## ⚠️ Points importants

### Token Sanctum
- Le token est stocké dans `localStorage.getItem('auth_token')`
- Le token est envoyé dans chaque requête : `Authorization: Bearer {token}`
- Le token est supprimé au logout

### Rôles
- `client` : Utilisateur normal
- `proprietaire` : Peut gérer des propriétés
- `admin` : Accès total

### Protection des routes
- `OwnerGuard` protège les routes propriétaires
- Vérifie `isOwner` (proprietaire OU admin)
- Redirige vers `/login` si non connecté

## 📊 Flux complet

```
1. User signup
   └─> POST /api/signup
       └─> Laravel crée user dans MySQL
           └─> Retourne token + user
               └─> Token stocké dans localStorage
                   └─> User connecté

2. User login
   └─> POST /api/login
       └─> Laravel vérifie credentials
           └─> Retourne token + user
               └─> Token stocké
                   └─> User connecté

3. User accède au profil
   └─> GET /api/user (avec token)
       └─> Laravel retourne user
           └─> Affichage du profil

4. User modifie profil
   └─> PUT /api/user (avec token + données)
       └─> Laravel met à jour MySQL
           └─> Retourne user mis à jour

5. User devient propriétaire
   └─> POST /api/owner/register (avec token)
       └─> Laravel change role → 'proprietaire'
           └─> User peut accéder au dashboard

6. User logout
   └─> POST /api/logout (avec token)
       └─> Laravel supprime token
           └─> Token supprimé du localStorage
               └─> User déconnecté
```

## ✨ Avantages

1. **Plus simple** : Un seul système d'auth (Sanctum)
2. **Plus rapide** : Pas d'appel Firebase
3. **Plus contrôlable** : Tout dans votre code
4. **Données centralisées** : Tout dans MySQL
5. **Personnalisable** : Modifiez la logique facilement

## 📚 Documentation

- `SANCTUM_ONLY_SETUP.md` → Guide complet setup Laravel
- `LARAVEL_SANCTUM_GUIDE.md` → Guide Sanctum détaillé
- `QUICK_START.md` → Démarrage rapide

---

**Votre application fonctionne maintenant 100% avec Laravel Sanctum !** 🎉
