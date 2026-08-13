# 🔥 Setup Firebase + Laravel

Cette configuration utilise **Firebase pour l'authentification** et **Laravel pour stocker les données**.

## Architecture

```
Frontend (React)
  ↓ Firebase Auth (email/password, Google, Facebook)
  ↓ Obtient token Firebase ID
  ↓ Envoie token à Laravel
  ↓
Backend (Laravel)
  ↓ Vérifie token avec Firebase Admin SDK
  ↓ Extrait firebase_uid
  ↓ Crée/récupère user dans MySQL
  ↓ Retourne les données
```

---

## 📦 Installation Backend Laravel

### Étape 1 : Créer le projet Laravel

```bash
composer create-project laravel/laravel backend
cd backend
```

### Étape 2 : Installer Firebase Admin SDK

```bash
composer require kreait/firebase-php
```

### Étape 3 : Configuration Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet
3. **Project Settings** → **Service Accounts**
4. Cliquer sur **"Generate new private key"**
5. Télécharger le fichier JSON
6. Renommer en `firebase-credentials.json`
7. Placer dans `storage/app/firebase-credentials.json`

**IMPORTANT** : Ajouter à `.gitignore` :
```
/storage/app/firebase-credentials.json
```

### Étape 4 : Configuration `.env`

```env
# Laravel
APP_NAME=LuxeStay
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=luxestay
DB_USERNAME=root
DB_PASSWORD=

# Frontend
FRONTEND_URL=http://localhost:5173

# Firebase
FIREBASE_CREDENTIALS=storage/app/firebase-credentials.json
```

### Étape 5 : Créer les migrations

```bash
php artisan make:migration create_users_table --create=users
```

**Migration: `database/migrations/xxxx_create_users_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('firebase_uid')->unique();
            $table->string('email')->unique();
            $table->string('firstName');
            $table->string('lastName');
            $table->string('phone')->nullable();
            $table->string('idPhoto')->nullable();
            $table->enum('role', ['admin', 'proprietaire', 'client'])->default('client');
            $table->timestamps();

            $table->index('firebase_uid');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

```bash
php artisan migrate
```

### Étape 6 : Créer le Model User

**Fichier: `app/Models/User.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'firebase_uid',
        'email',
        'firstName',
        'lastName',
        'phone',
        'idPhoto',
        'role',
    ];

    protected $hidden = [];

    protected $casts = [];
}
```

### Étape 7 : Créer le Service Firebase

```bash
mkdir app/Services
```

**Fichier: `app/Services/FirebaseService.php`**

```php
<?php

namespace App\Services;

use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;

class FirebaseService
{
    protected $auth;

    public function __construct()
    {
        $credentialsPath = storage_path('app/firebase-credentials.json');
        
        if (!file_exists($credentialsPath)) {
            throw new \Exception('Firebase credentials file not found at: ' . $credentialsPath);
        }

        $factory = (new Factory)->withServiceAccount($credentialsPath);
        $this->auth = $factory->createAuth();
    }

    /**
     * Vérifie un token Firebase ID et retourne le UID
     */
    public function verifyIdToken(string $idToken): string
    {
        try {
            $verifiedIdToken = $this->auth->verifyIdToken($idToken);
            return $verifiedIdToken->claims()->get('sub'); // sub = firebase_uid
        } catch (\Exception $e) {
            throw new \Exception('Token Firebase invalide: ' . $e->getMessage());
        }
    }

    /**
     * Récupère les informations d'un utilisateur Firebase
     */
    public function getUser(string $uid)
    {
        return $this->auth->getUser($uid);
    }
}
```

### Étape 8 : Créer le Middleware Firebase

```bash
php artisan make:middleware FirebaseAuthMiddleware
```

**Fichier: `app/Http/Middleware/FirebaseAuthMiddleware.php`**

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FirebaseService;

class FirebaseAuthMiddleware
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        try {
            $firebaseUid = $this->firebase->verifyIdToken($token);
            $request->attributes->set('firebase_uid', $firebaseUid);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Token invalide ou expiré'], 401);
        }

        return $next($request);
    }
}
```

**Enregistrer le middleware dans `bootstrap/app.php`** :

```php
use App\Http\Middleware\FirebaseAuthMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'firebase.auth' => FirebaseAuthMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

### Étape 9 : Créer AuthController

```bash
php artisan make:controller AuthController
```

**Fichier: `app/Http/Controllers/AuthController.php`**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\FirebaseService;

class AuthController extends Controller
{
    protected $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    /**
     * Vérifie le token Firebase et retourne l'utilisateur
     */
    public function verify(Request $request)
    {
        $firebaseUid = $request->attributes->get('firebase_uid');

        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Synchronise l'utilisateur Firebase avec MySQL
     */
    public function sync(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'firstName' => 'required|string',
            'lastName' => 'required|string',
            'phone' => 'nullable|string',
            'idPhoto' => 'nullable|string',
        ]);

        $firebaseUid = $request->attributes->get('firebase_uid');

        $user = User::updateOrCreate(
            ['firebase_uid' => $firebaseUid],
            [
                'email' => $request->email,
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'phone' => $request->phone,
                'idPhoto' => $request->idPhoto,
            ]
        );

        return response()->json([
            'message' => 'Utilisateur synchronisé',
            'user' => $user
        ]);
    }
}
```

### Étape 10 : Créer OwnerController

```bash
php artisan make:controller OwnerController
```

**Fichier: `app/Http/Controllers/OwnerController.php`**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class OwnerController extends Controller
{
    /**
     * Enregistrer comme propriétaire
     */
    public function register(Request $request)
    {
        $request->validate([
            'propertyType' => 'required|string',
            'propertyName' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $firebaseUid = $request->attributes->get('firebase_uid');

        $user = User::where('firebase_uid', $firebaseUid)->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Mettre à jour le rôle
        $user->update(['role' => 'proprietaire']);

        // TODO: Créer la propriété dans une table properties

        return response()->json([
            'message' => 'Enregistré comme propriétaire',
            'user' => $user
        ]);
    }
}
```

### Étape 11 : Configurer les routes

**Fichier: `routes/api.php`**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OwnerController;

// Routes protégées par Firebase Auth
Route::middleware('firebase.auth')->group(function () {
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    Route::post('/auth/sync', [AuthController::class, 'sync']);
    
    // Routes propriétaire
    Route::post('/owner/register', [OwnerController::class, 'register']);
});
```

### Étape 12 : Configurer CORS

**Fichier: `config/cors.php`**

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
    'supports_credentials' => false,
];
```

### Étape 13 : Démarrer le serveur

```bash
php artisan serve
```

---

## 🧪 Tests

### Test 1 : Vérifier le token

```bash
# Obtenir un token depuis Firebase (connectez-vous dans l'app)
# Puis testez :

curl -X GET http://localhost:8000/api/auth/verify \
  -H "Authorization: Bearer VOTRE_TOKEN_FIREBASE"
```

### Test 2 : Synchroniser l'utilisateur

```bash
curl -X POST http://localhost:8000/api/auth/sync \
  -H "Authorization: Bearer VOTRE_TOKEN_FIREBASE" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+33612345678"
  }'
```

---

## ✅ Checklist

- [ ] Laravel installé
- [ ] Firebase Admin SDK installé (`kreait/firebase-php`)
- [ ] Fichier `firebase-credentials.json` téléchargé et placé
- [ ] Migration exécutée
- [ ] FirebaseService créé
- [ ] Middleware FirebaseAuthMiddleware créé et enregistré
- [ ] AuthController créé
- [ ] OwnerController créé
- [ ] Routes configurées
- [ ] CORS configuré
- [ ] Serveur Laravel démarré
- [ ] Tests réussis

---

## 🔒 Sécurité

**IMPORTANT** : Ne JAMAIS commit `firebase-credentials.json` sur Git !

Ajouter à `.gitignore` :
```
/storage/app/firebase-credentials.json
```

---

**Votre backend Laravel est maintenant configuré pour vérifier les tokens Firebase !** 🎉
