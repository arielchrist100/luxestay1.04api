# Guide d'intégration Laravel Backend

Ce document décrit comment configurer le backend Laravel pour fonctionner avec l'application React de réservation d'hôtels.

## 🔥 Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │  Token  │   Laravel    │  Query  │   MySQL     │
│  Frontend   │────────>│   Backend    │────────>│  Database   │
│  (Firebase) │         │  (API REST)  │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

## 📋 Flux d'authentification

1. **Login** : L'utilisateur se connecte via Firebase Authentication (React)
2. **Token** : React récupère le token Firebase ID
3. **Vérification** : React envoie le token à Laravel (`POST /api/auth/verify`)
4. **Validation** : Laravel vérifie le token auprès de Firebase Admin SDK
5. **Base de données** : Laravel vérifie/crée l'utilisateur dans MySQL
6. **Rôle** : Laravel retourne les informations utilisateur avec son rôle

## 🗄️ Structure de la base de données MySQL

### Table `users`

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    id_photo VARCHAR(500),
    role ENUM('admin', 'proprietaire', 'client') DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email),
    INDEX idx_role (role)
);
```

### Table `logements` (propriétés)

```sql
CREATE TABLE logements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('hotel', 'house', 'apartment', 'villa') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    bedrooms INT NOT NULL,
    bathrooms INT NOT NULL,
    guests INT NOT NULL,
    description TEXT,
    amenities JSON,
    images JSON,
    visits INT DEFAULT 0,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_price (price)
);
```

### Table `reservations`

```sql
CREATE TABLE reservations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    logement_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    date_arrivee DATE NOT NULL,
    date_depart DATE NOT NULL,
    guests INT NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (logement_id) REFERENCES logements(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_logement_id (logement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (date_arrivee, date_depart)
);
```

## 🚀 Installation Laravel

### 1. Installer Firebase Admin SDK

```bash
composer require kreait/firebase-php
```

### 2. Configuration Firebase

Créer le fichier `config/firebase.php` :

```php
<?php

return [
    'credentials' => [
        'file' => env('FIREBASE_CREDENTIALS'),
    ],
    'database' => [
        'url' => env('FIREBASE_DATABASE_URL'),
    ],
];
```

Ajouter dans `.env` :

```env
FIREBASE_CREDENTIALS=/path/to/firebase-credentials.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 3. Middleware d'authentification Firebase

Créer `app/Http/Middleware/FirebaseAuth.php` :

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;

class FirebaseAuthMiddleware
{
    protected $auth;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(config('firebase.credentials.file'));
        $this->auth = $factory->createAuth();
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token non fourni'], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');
            
            // Récupérer l'utilisateur depuis la base de données
            $user = \App\Models\User::where('firebase_uid', $uid)->first();
            
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non trouvé'], 404);
            }

            $request->merge(['authenticated_user' => $user]);
            
            return $next($request);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalide', 'message' => $e->getMessage()], 401);
        }
    }
}
```

Enregistrer le middleware dans `app/Http/Kernel.php` :

```php
protected $routeMiddleware = [
    // ...
    'firebase' => \App\Http\Middleware\FirebaseAuthMiddleware::class,
];
```

## 📡 Routes API (`routes/api.php`)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\BookingController;

// Routes publiques
Route::post('/auth/verify', [AuthController::class, 'verifyAuth']);
Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/properties/{id}', [PropertyController::class, 'show']);

// Routes protégées par Firebase Auth
Route::middleware('firebase')->group(function () {
    // Sync user
    Route::post('/auth/sync', [AuthController::class, 'syncUser']);
    
    // Routes propriétaire
    Route::prefix('owner')->group(function () {
        Route::post('/register', [OwnerController::class, 'register']);
        Route::get('/dashboard', [OwnerController::class, 'dashboard']);
        Route::get('/bookings', [OwnerController::class, 'bookings']);
        Route::post('/properties', [OwnerController::class, 'addProperty']);
        Route::put('/properties/{id}', [OwnerController::class, 'updateProperty']);
        Route::delete('/properties/{id}', [OwnerController::class, 'deleteProperty']);
    });
    
    // Routes réservations
    Route::post('/bookings', [BookingController::class, 'create']);
    Route::get('/user/bookings', [BookingController::class, 'getUserBookings']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
});
```

## 🎯 Controllers

### AuthController (`app/Http/Controllers/AuthController.php`)

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Kreait\Firebase\Factory;

class AuthController extends Controller
{
    protected $auth;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(config('firebase.credentials.file'));
        $this->auth = $factory->createAuth();
    }

    public function verifyAuth(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token non fourni'], 401);
        }

        try {
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            $uid = $verifiedIdToken->claims()->get('sub');
            
            $user = User::where('firebase_uid', $uid)->first();
            
            if (!$user) {
                return response()->json(['error' => 'Utilisateur non trouvé'], 404);
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'firebase_uid' => $user->firebase_uid,
                    'email' => $user->email,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'idPhoto' => $user->id_photo,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalide'], 401);
        }
    }

    public function syncUser(Request $request)
    {
        $authenticatedUser = $request->input('authenticated_user');
        
        $validated = $request->validate([
            'email' => 'required|email',
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'phone' => 'required|string',
            'idPhoto' => 'nullable|string',
        ]);

        $user = User::updateOrCreate(
            ['firebase_uid' => $authenticatedUser->firebase_uid],
            [
                'email' => $validated['email'],
                'first_name' => $validated['firstName'],
                'last_name' => $validated['lastName'],
                'phone' => $validated['phone'],
                'id_photo' => $validated['idPhoto'] ?? null,
            ]
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'firebase_uid' => $user->firebase_uid,
                'email' => $user->email,
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'phone' => $user->phone,
                'role' => $user->role,
                'idPhoto' => $user->id_photo,
            ]
        ]);
    }
}
```

### OwnerController (`app/Http/Controllers/OwnerController.php`)

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Logement;
use App\Models\Reservation;
use Illuminate\Support\Facades\DB;

class OwnerController extends Controller
{
    public function register(Request $request)
    {
        $user = $request->input('authenticated_user');
        
        // Mettre à jour le rôle en propriétaire
        $user->update(['role' => 'proprietaire']);

        return response()->json([
            'message' => 'Enregistré comme propriétaire avec succès',
            'owner' => $user
        ]);
    }

    public function dashboard(Request $request)
    {
        $user = $request->input('authenticated_user');
        
        if ($user->role !== 'proprietaire' && $user->role !== 'admin') {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $properties = Logement::where('user_id', $user->id)->get();
        
        $stats = [
            'totalRevenue' => Reservation::whereIn('logement_id', $properties->pluck('id'))
                ->where('status', '!=', 'cancelled')
                ->sum('total'),
            'totalBookings' => Reservation::whereIn('logement_id', $properties->pluck('id'))
                ->where('status', '!=', 'cancelled')
                ->count(),
            'totalVisits' => $properties->sum('visits'),
            'avgOccupancy' => $this->calculateAverageOccupancy($properties),
        ];

        $propertiesWithStats = $properties->map(function ($property) {
            $bookings = Reservation::where('logement_id', $property->id)
                ->where('status', '!=', 'cancelled')
                ->get();
            
            return [
                'id' => $property->id,
                'name' => $property->name,
                'type' => ucfirst($property->type),
                'location' => $property->city . ', ' . $property->country,
                'image' => json_decode($property->images)[0] ?? '',
                'price' => (float) $property->price,
                'visits' => $property->visits,
                'bookings' => $bookings->count(),
                'revenue' => $bookings->sum('total'),
                'occupancyRate' => $this->calculateOccupancyRate($property, $bookings),
            ];
        });

        return response()->json([
            'stats' => $stats,
            'properties' => $propertiesWithStats,
        ]);
    }

    public function bookings(Request $request)
    {
        $user = $request->input('authenticated_user');
        
        if ($user->role !== 'proprietaire' && $user->role !== 'admin') {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $properties = Logement::where('user_id', $user->id)->get();
        
        $bookings = Reservation::whereIn('logement_id', $properties->pluck('id'))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($booking) {
                $logement = Logement::find($booking->logement_id);
                return [
                    'id' => $booking->id,
                    'propertyName' => $logement->name,
                    'guestName' => $booking->guest_name,
                    'checkIn' => $booking->date_arrivee,
                    'checkOut' => $booking->date_depart,
                    'amount' => (float) $booking->total,
                    'status' => $booking->status,
                ];
            });

        return response()->json(['bookings' => $bookings]);
    }

    public function addProperty(Request $request)
    {
        $user = $request->input('authenticated_user');
        
        if ($user->role !== 'proprietaire' && $user->role !== 'admin') {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'type' => 'required|in:hotel,house,apartment,villa',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'price' => 'required|numeric|min:0',
            'bedrooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'guests' => 'required|integer|min:1',
            'description' => 'required|string',
            'amenities' => 'array',
            'images' => 'array',
        ]);

        $property = Logement::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'type' => $validated['type'],
            'address' => $validated['address'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'price' => $validated['price'],
            'bedrooms' => $validated['bedrooms'],
            'bathrooms' => $validated['bathrooms'],
            'guests' => $validated['guests'],
            'description' => $validated['description'],
            'amenities' => json_encode($validated['amenities'] ?? []),
            'images' => json_encode($validated['images'] ?? []),
        ]);

        return response()->json([
            'message' => 'Propriété ajoutée avec succès',
            'property' => $property
        ], 201);
    }

    public function deleteProperty(Request $request, $id)
    {
        $user = $request->input('authenticated_user');
        
        $property = Logement::findOrFail($id);
        
        if ($property->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['error' => 'Accès refusé'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Propriété supprimée avec succès']);
    }

    private function calculateOccupancyRate($property, $bookings)
    {
        // Calcul simplifié - à adapter selon vos besoins
        $daysBooked = $bookings->sum(function ($booking) {
            return (strtotime($booking->date_depart) - strtotime($booking->date_arrivee)) / 86400;
        });
        
        $daysInYear = 365;
        return min(100, round(($daysBooked / $daysInYear) * 100));
    }

    private function calculateAverageOccupancy($properties)
    {
        if ($properties->isEmpty()) {
            return 0;
        }

        $totalOccupancy = 0;
        foreach ($properties as $property) {
            $bookings = Reservation::where('logement_id', $property->id)
                ->where('status', '!=', 'cancelled')
                ->get();
            $totalOccupancy += $this->calculateOccupancyRate($property, $bookings);
        }

        return round($totalOccupancy / $properties->count());
    }
}
```

## 🔧 Configuration CORS

Dans `config/cors.php` :

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

Dans `.env` :

```env
FRONTEND_URL=http://localhost:5173
```

## 🌐 Configuration React

Créer `.env` dans le projet React :

```env
VITE_API_URL=http://localhost:8000/api
```

## ✅ Tests

### Test de connexion et vérification

```bash
# 1. Démarrer Laravel
php artisan serve

# 2. Se connecter sur React
# 3. Vérifier dans les DevTools que le token est envoyé
# 4. Vérifier dans la base MySQL que l'utilisateur est créé
```

## 📝 Checklist d'implémentation

- [ ] Installer Firebase Admin SDK
- [ ] Configurer les credentials Firebase
- [ ] Créer les migrations de base de données
- [ ] Implémenter le middleware FirebaseAuth
- [ ] Créer les controllers (Auth, Owner, Property, Booking)
- [ ] Configurer CORS
- [ ] Tester l'authentification
- [ ] Tester les endpoints propriétaire
- [ ] Implémenter la gestion des images (upload)
- [ ] Ajouter la validation des données

## 🚨 Sécurité

1. **Toujours valider le token Firebase** côté Laravel
2. **Vérifier les permissions** avant chaque action sensible
3. **Utiliser des transactions** pour les opérations critiques
4. **Limiter le rate limiting** sur les endpoints publics
5. **Hasher les données sensibles** si nécessaire

---

Cette architecture garantit que :
- ✅ L'authentification est gérée par Firebase (sécurisé)
- ✅ Les données métier sont dans MySQL (performant)
- ✅ Laravel valide tous les accès (sécurisé)
- ✅ React communique uniquement avec Laravel (centralisé)
