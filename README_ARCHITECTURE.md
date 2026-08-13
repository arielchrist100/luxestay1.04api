# 🏗️ Architecture de l'Application

## 📋 Vue d'ensemble

Cette application de réservation d'hôtels et de maisons utilise une architecture moderne avec :

- **Frontend** : React + TypeScript + Tailwind CSS + Motion
- **Authentification** : Firebase Authentication
- **Backend** : Laravel (API REST)
- **Base de données** : MySQL

## 🔄 Flux d'authentification complet

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUX D'AUTHENTIFICATION                      │
└─────────────────────────────────────────────────────────────────┘

1. Utilisateur clique sur "Connexion"
   │
   ├──> Page /login (React)
   │
2. Connexion via Firebase (Email/Google/Facebook)
   │
   ├──> Firebase Authentication retourne un token JWT
   │
3. React stocke le token et les infos Firebase
   │
   ├──> UserContext écoute les changements auth (onAuthStateChanged)
   │
4. React envoie le token à Laravel (GET /api/auth/verify)
   │
   ├──> Laravel vérifie le token avec Firebase Admin SDK
   │
5. Laravel cherche l'utilisateur dans MySQL (firebase_uid)
   │
   ├──> Si existe : retourne les données (id, role, etc.)
   ├──> Si n'existe pas : erreur 404
   │
6. React reçoit les données complètes utilisateur
   │
   └──> UserContext met à jour l'état avec le rôle
```

## 🗄️ Structure de la base de données

### Table `users`
- `id` : Clé primaire
- `firebase_uid` : UID Firebase (unique)
- `email` : Email de l'utilisateur
- `first_name`, `last_name`, `phone` : Informations personnelles
- `role` : 'admin' | 'proprietaire' | 'client'
- `id_photo` : URL de la photo de profil

### Table `logements`
- `id` : Clé primaire
- `user_id` : ID du propriétaire (FK → users.id)
- `name`, `type`, `address`, `city`, `country` : Informations de base
- `price`, `bedrooms`, `bathrooms`, `guests` : Détails
- `description`, `amenities`, `images` : Contenu
- `visits` : Nombre de vues

### Table `reservations`
- `id` : Clé primaire
- `logement_id` : ID du logement (FK → logements.id)
- `user_id` : ID du client (FK → users.id)
- `guest_name` : Nom du client
- `date_arrivee`, `date_depart` : Dates de séjour
- `total` : Montant total
- `status` : 'pending' | 'confirmed' | 'completed' | 'cancelled'

## 🚀 Flux "Devenir Propriétaire"

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUX INSCRIPTION PROPRIÉTAIRE                      │
└─────────────────────────────────────────────────────────────────┘

1. Utilisateur connecté clique "Je suis propriétaire"
   │
   ├──> Redirection vers /owner/register
   │
2. Remplit le formulaire (nom propriété, adresse, etc.)
   │
   ├──> Soumission du formulaire
   │
3. React appelle apiService.syncUser()
   │
   ├──> POST /api/auth/sync (crée/met à jour dans MySQL)
   │
4. React appelle apiService.registerAsOwner()
   │
   ├──> POST /api/owner/register
   │
5. Laravel met à jour users.role = 'proprietaire'
   │
   └──> Redirection vers /owner/dashboard
```

## 📊 Flux "Dashboard Propriétaire"

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLUX DASHBOARD PROPRIÉTAIRE                    │
└─────────────────────────────────────────────────────────────────┘

1. Utilisateur accède à /owner/dashboard
   │
   ├──> OwnerGuard vérifie :
   │    - Est connecté ? (firebaseUser)
   │    - A le rôle ? (user.role === 'proprietaire')
   │
2. Si OK, affiche le Dashboard
   │
   ├──> GET /api/owner/dashboard (avec token Firebase)
   │
3. Laravel vérifie le token et le rôle
   │
   ├──> Récupère les logements du propriétaire (logements.user_id)
   ├──> Calcule les statistiques :
   │    - Total revenus (SUM reservations.total)
   │    - Total réservations (COUNT)
   │    - Total vues (SUM logements.visits)
   │    - Taux d'occupation moyen
   │
4. React affiche les données dans le dashboard
   │
   └──> 3 onglets : Vue d'ensemble, Propriétés, Réservations
```

## 🏠 Flux "Ajouter une Propriété"

```
┌─────────────────────────────────────────────────────────────────┐
│                  FLUX AJOUT PROPRIÉTÉ                           │
└─────────────────────────────────────────────────────────────────┘

1. Propriétaire clique "Ajouter une propriété"
   │
   ├──> Redirection vers /owner/add-property
   │
2. OwnerGuard vérifie les droits
   │
   ├──> Si OK, affiche le formulaire
   │
3. Propriétaire remplit :
   │  - Informations de base (nom, type, prix)
   │  - Localisation (adresse, ville, pays)
   │  - Détails (chambres, SdB, capacité)
   │  - Équipements (WiFi, parking, etc.)
   │  - Description et photos
   │
4. Soumission du formulaire
   │
   ├──> POST /api/owner/properties (avec token)
   │
5. Laravel :
   │  - Vérifie le token et le rôle
   │  - Valide les données
   │  - Insère dans logements (avec user_id)
   │
6. Redirection vers /owner/dashboard
   │
   └──> La nouvelle propriété apparaît
```

## 🔒 Sécurité

### Vérification à chaque requête

Toutes les requêtes protégées passent par le middleware Firebase :

1. **React** envoie le token dans le header `Authorization: Bearer <token>`
2. **Laravel** vérifie le token avec Firebase Admin SDK
3. **Laravel** récupère l'utilisateur depuis MySQL
4. **Laravel** vérifie les permissions (rôle)
5. Si OK → Traite la requête
6. Si KO → Retourne 401/403

### Protection côté React

- `OwnerGuard` : Composant qui protège les routes propriétaires
  - Vérifie si l'utilisateur est connecté
  - Vérifie si l'utilisateur a le rôle `proprietaire` ou `admin`
  - Redirige vers login ou affiche un message d'erreur

### Protection côté Laravel

- Middleware `firebase` sur toutes les routes sensibles
- Vérification du rôle dans les controllers
- Vérification de propriété (ex: un propriétaire ne peut supprimer que ses propres logements)

## 📁 Structure des fichiers

### React (Frontend)

```
src/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx              # Navigation avec bouton "Je suis propriétaire"
│   │   ├── OwnerGuard.tsx          # Protection des routes propriétaires
│   │   └── ...
│   ├── context/
│   │   └── UserContext.tsx         # Gestion de l'état utilisateur + rôle
│   ├── pages/
│   │   ├── Home.tsx                # Page d'accueil
│   │   ├── Login.tsx               # Connexion Firebase
│   │   ├── SignUp.tsx              # Inscription Firebase
│   │   ├── OwnerRegister.tsx       # Inscription propriétaire
│   │   ├── OwnerDashboard.tsx      # Dashboard propriétaire
│   │   └── AddProperty.tsx         # Ajout de propriété
│   ├── services/
│   │   └── api.ts                  # Service API Laravel
│   ├── config/
│   │   └── firebase.ts             # Configuration Firebase
│   └── routes.ts                   # Routes React Router
```

### Laravel (Backend)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php       # Vérification token, sync user
│   │   ├── OwnerController.php      # Dashboard, propriétés
│   │   ├── PropertyController.php   # Liste publique des propriétés
│   │   └── BookingController.php    # Réservations
│   └── Middleware/
│       └── FirebaseAuthMiddleware.php  # Vérification token Firebase
└── Models/
    ├── User.php
    ├── Logement.php
    └── Reservation.php
```

## 🌐 Variables d'environnement

### React (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Laravel (.env)

```env
FIREBASE_CREDENTIALS=/path/to/firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
FRONTEND_URL=http://localhost:5173
```

## 🔧 Installation

### 1. React

```bash
cd frontend
npm install
cp .env.example .env
# Configurer les variables Firebase
npm run dev
```

### 2. Laravel

```bash
cd backend
composer install
cp .env.example .env
# Configurer les variables
php artisan migrate
php artisan serve
```

### 3. Firebase

1. Créer un projet Firebase
2. Activer Authentication (Email, Google, Facebook)
3. Télécharger les credentials JSON
4. Configurer les variables dans React et Laravel

## ✅ Checklist de démarrage

- [ ] Firebase configuré (credentials, providers)
- [ ] Base MySQL créée et migrée
- [ ] Laravel démarré (port 8000)
- [ ] React démarré (port 5173)
- [ ] Test de connexion
- [ ] Test d'inscription propriétaire
- [ ] Test d'ajout de propriété
- [ ] Vérification des données dans MySQL

## 📝 Documentation complète

- `LARAVEL_BACKEND_GUIDE.md` : Guide complet backend Laravel
- `FIREBASE_SETUP.md` : Configuration Firebase Authentication
- `SOCIAL_LOGIN_GUIDE.md` : Configuration Google/Facebook login

---

**Note importante** : Cette architecture garantit que toutes les données sensibles (rôles, propriétés, réservations) sont gérées côté serveur (Laravel + MySQL) tout en utilisant Firebase uniquement pour l'authentification sécurisée.
