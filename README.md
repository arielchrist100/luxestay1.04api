# 🏨 LuxeStay - Application de Réservation d'Hôtels

Application moderne de réservation d'hôtels et de maisons avec authentification Laravel Sanctum.

## 🎯 Fonctionnalités

- ✅ Authentification utilisateur (Laravel Sanctum)
- ✅ Social login (Google/Facebook)
- ✅ Gestion de profil utilisateur
- ✅ Espace propriétaire
- ✅ Dashboard propriétaire avec statistiques
- ✅ Ajout de propriétés
- ✅ Système de réservations
- ✅ Design moderne avec glassmorphisme
- ✅ Animations fluides (Motion)
- ✅ Responsive design

## 🏗️ Architecture

```
Frontend: React + TypeScript + Tailwind CSS + Motion
Backend: Laravel + MySQL
Auth: Laravel Sanctum (tokens API)
```

## 📦 Installation

### Prérequis

- Node.js 18+ et pnpm
- PHP 8.1+ et Composer
- MySQL 8.0+

### 1. Frontend React

```bash
# Installation
pnpm install

# Variables d'environnement
cp .env.example .env
# Configurer VITE_API_URL=http://localhost:8000/api

# Démarrage
pnpm dev
```

### 2. Backend Laravel

Suivre le guide complet : `SANCTUM_ONLY_SETUP.md`

```bash
# Créer le projet
composer create-project laravel/laravel backend
cd backend

# Installer Sanctum
composer require laravel/sanctum
composer require laravel/socialite

# Configurer .env (MySQL + FRONTEND_URL)
# Créer les migrations
# Créer les controllers
# Configurer les routes

# Démarrer
php artisan serve
```

## 📚 Documentation

### Guides principaux

1. **SANCTUM_ONLY_SETUP.md** 🔥
   - Setup complet Laravel Sanctum
   - Migrations, Controllers, Routes
   - Configuration OAuth

2. **CHANGEMENTS_FIREBASE_TO_SANCTUM.md**
   - Ce qui a changé vs Firebase
   - Fichiers modifiés
   - Flux complet

3. **LARAVEL_SANCTUM_GUIDE.md**
   - Guide détaillé Sanctum
   - Tous les endpoints
   - Service API React

### Guides de référence

- `LARAVEL_BACKEND_GUIDE.md` - Structure backend complète
- `AUTHENTICATION_FLOW.md` - Flow d'authentification
- `README_ARCHITECTURE.md` - Architecture globale
- `QUICK_START.md` - Démarrage rapide
- `MIGRATION_FIREBASE_TO_SANCTUM.md` - Migration depuis Firebase

## 🚀 Démarrage rapide

### Étape 1 : Installer le frontend

```bash
pnpm install
pnpm dev
```

### Étape 2 : Installer le backend

Suivre `SANCTUM_ONLY_SETUP.md` :

1. Créer projet Laravel
2. Installer Sanctum + Socialite
3. Créer les migrations
4. Créer AuthController + OwnerController
5. Configurer les routes
6. Démarrer le serveur

### Étape 3 : Tester

1. Aller sur `http://localhost:5173`
2. Cliquer sur "Créer un compte"
3. S'inscrire avec email/password
4. Vérifier le menu profil
5. Tester la page `/profile`

## 🎨 Pages disponibles

### Publiques
- `/` - Page d'accueil
- `/search` - Recherche de propriétés
- `/property/:id` - Détails d'une propriété
- `/login` - Connexion
- `/signup` - Inscription

### Utilisateur connecté
- `/profile` - Gestion du profil
- `/auth/callback` - Callback social login

### Propriétaire
- `/owner/register` - Inscription propriétaire
- `/owner/dashboard` - Dashboard propriétaire
- `/owner/add-property` - Ajouter une propriété

## 🔐 Authentification

### Email/Password

```typescript
import { useAuth } from './context/AuthContext';

const { login, signup, logout } = useAuth();

// Signup
await signup({
  name: 'Jean Dupont',
  email: 'jean@example.com',
  password: 'password123',
  phone: '+33612345678'
});

// Login
await login('jean@example.com', 'password123');

// Logout
await logout();
```

### Social Login

```typescript
import { sanctumApi } from './services/sanctumApi';

// Google
sanctumApi.socialLogin('google');

// Facebook
sanctumApi.socialLogin('facebook');
```

## 📊 Structure des données

### User

```typescript
{
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'proprietaire' | 'client';
}
```

### Token

Stocké dans `localStorage.getItem('auth_token')`

## 🧪 Tests

### Backend (avec Postman/Insomnia)

```bash
# Signup
POST http://localhost:8000/api/signup
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123"
}

# Login
POST http://localhost:8000/api/login
{
  "email": "jean@example.com",
  "password": "password123"
}

# Get User
GET http://localhost:8000/api/user
Authorization: Bearer {token}
```

### Frontend

1. Signup → Vérifier user créé dans MySQL
2. Login → Vérifier menu profil
3. Profile → Modifier et sauvegarder
4. Owner register → Vérifier rôle changé
5. Social login → Tester Google/Facebook

## 🛠️ Technologies

### Frontend
- React 18
- TypeScript
- Tailwind CSS v4
- Motion (Framer Motion)
- Axios
- React Router
- Lucide Icons

### Backend
- Laravel 10+
- Laravel Sanctum
- Laravel Socialite
- MySQL 8+

## 📝 Notes importantes

### Token Sanctum
- Token stocké dans localStorage
- Token envoyé dans chaque requête
- Token supprimé au logout

### Rôles
- `client` : Utilisateur normal
- `proprietaire` : Gestion de propriétés
- `admin` : Accès complet

### CORS
Laravel doit accepter les requêtes de `http://localhost:5173`

## 🐛 Dépannage

### Erreur "Token invalide"
- Vérifier que Laravel Sanctum est configuré
- Vérifier la configuration CORS
- Vérifier que le token est envoyé

### Erreur "CORS"
- Configurer `config/cors.php` dans Laravel
- Ajouter `FRONTEND_URL` dans `.env`

### Social login ne fonctionne pas
- Vérifier les credentials Google/Facebook
- Vérifier les redirect URIs
- Vérifier Socialite installé

## 📄 Licence

MIT

## 👥 Auteurs

Développé avec ❤️ et Claude Code

---

**Pour commencer** : Suivre `SANCTUM_ONLY_SETUP.md` 🚀
# luxestay1.04api
