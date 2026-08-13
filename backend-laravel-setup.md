# Configuration Backend Laravel pour LuxeStay

## Installation Rapide

### 1. Créer le projet Laravel (si pas encore fait)

```bash
composer create-project laravel/laravel backend
cd backend
```

### 2. Installer les dépendances

```bash
composer require laravel/sanctum
composer require laravel/socialite
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### 3. Configuration `.env`

```env
APP_NAME=LuxeStay
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=luxestay
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Facebook OAuth (optionnel)
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
```

### 4. Créer la base de données

```bash
# Créer la base de données
mysql -u root -p
CREATE DATABASE luxestay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Ou importer le fichier SQL complet
mysql -u root -p luxestay < database.sql
```

### 5. Créer les migrations

```bash
php artisan make:migration add_fields_to_users_table
php artisan make:migration create_properties_table
```

**Migration: `database/migrations/xxxx_add_fields_to_users_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('provider')->nullable()->after('email');
            $table->string('provider_id')->nullable()->after('provider');
            $table->string('avatar')->nullable()->after('provider_id');
            $table->string('phone')->nullable()->after('avatar');
            $table->enum('role', ['admin', 'proprietaire', 'client'])->default('client')->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['provider', 'provider_id', 'avatar', 'phone', 'role']);
        });
    }
};
```

**Migration: `database/migrations/xxxx_create_properties_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->enum('type', ['hotel', 'house', 'apartment', 'villa']);
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('country');
            $table->decimal('price_per_night', 10, 2)->default(0);
            $table->integer('bedrooms')->default(1);
            $table->integer('bathrooms')->default(1);
            $table->integer('max_guests')->default(2);
            $table->json('amenities')->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
```

```bash
# Exécuter les migrations
php artisan migrate
```

### 6. Modifier le Model User

**Fichier: `app/Models/User.php`**

```php
<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'provider',
        'provider_id',
        'avatar',
        'phone',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relations
    public function properties()
    {
        return $this->hasMany(Property::class, 'owner_id');
    }
}
```

### 7. Créer le Model Property

```bash
php artisan make:model Property
```

**Fichier: `app/Models/Property.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'owner_id',
        'name',
        'type',
        'description',
        'address',
        'city',
        'country',
        'price_per_night',
        'bedrooms',
        'bathrooms',
        'max_guests',
        'amenities',
        'images',
        'status',
    ];

    protected $casts = [
        'amenities' => 'array',
        'images' => 'array',
        'price_per_night' => 'decimal:2',
    ];

    // Relations
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
```

### 8. Créer AuthController

```bash
php artisan make:controller AuthController
```

**Fichier: `app/Http/Controllers/AuthController.php`**

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription
     */
    public function signup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ]
        ], 201);
    }

    /**
     * Connexion
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Déconnexion
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès'
        ]);
    }

    /**
     * Récupérer l'utilisateur
     */
    public function getUser(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Mettre à jour le profil
     */
    public function updateUser(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'nullable|string',
            'avatar' => 'nullable|string',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Social login - Redirection
     */
    public function redirectToProvider($provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['error' => 'Provider non supporté'], 400);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Social login - Callback
     */
    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            $user = User::where('provider', $provider)
                        ->where('provider_id', $socialUser->id)
                        ->first();

            if (!$user) {
                $user = User::where('email', $socialUser->email)->first();

                if ($user) {
                    $user->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->id,
                        'avatar' => $socialUser->avatar ?? $user->avatar,
                    ]);
                } else {
                    $user = User::create([
                        'name' => $socialUser->name,
                        'email' => $socialUser->email,
                        'provider' => $provider,
                        'provider_id' => $socialUser->id,
                        'avatar' => $socialUser->avatar,
                        'password' => Hash::make(uniqid()),
                    ]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=social_auth_failed');
        }
    }
}
```

### 9. Créer OwnerController

```bash
php artisan make:controller OwnerController
```

**Fichier: `app/Http/Controllers/OwnerController.php`**

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Property;

class OwnerController extends Controller
{
    /**
     * Enregistrer comme propriétaire et créer la première propriété
     */
    public function register(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'propertyType' => 'required|in:hotel,house,apartment,villa',
            'propertyName' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        // Mettre à jour le rôle de l'utilisateur
        $user->update(['role' => 'proprietaire']);

        // Créer la première propriété
        $property = Property::create([
            'owner_id' => $user->id,
            'name' => $validated['propertyName'],
            'type' => $validated['propertyType'],
            'description' => $validated['description'] ?? '',
            'address' => $validated['address'],
            'city' => $validated['city'],
            'country' => $validated['country'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Enregistré comme propriétaire avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'role' => $user->role,
            ],
            'property' => $property
        ], 201);
    }

    /**
     * Récupérer les propriétés du propriétaire
     */
    public function getProperties(Request $request)
    {
        $user = $request->user();
        $properties = $user->properties;

        return response()->json([
            'properties' => $properties
        ]);
    }
}
```

### 10. Configurer les routes

**Fichier: `routes/api.php`**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OwnerController;

// Routes publiques
Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);

// Social auth
Route::get('/auth/{provider}', [AuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [AuthController::class, 'handleProviderCallback']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    Route::put('/user', [AuthController::class, 'updateUser']);

    // Routes propriétaire
    Route::post('/owner/register', [OwnerController::class, 'register']);
    Route::get('/owner/properties', [OwnerController::class, 'getProperties']);
});
```

### 11. Configurer CORS

**Fichier: `config/cors.php`**

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 12. Configurer Sanctum

**Fichier: `config/sanctum.php`**

Modifier la ligne `stateful`:

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost,localhost:5173,127.0.0.1,127.0.0.1:5173')),
```

### 13. Démarrer le serveur

```bash
php artisan serve
```

Le serveur Laravel sera accessible sur `http://localhost:8000`

## Tests avec Postman/Insomnia

### 1. Signup
```http
POST http://localhost:8000/api/signup
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "phone": "+33612345678"
}
```

### 2. Login
```http
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "password123"
}
```

### 3. Get User
```http
GET http://localhost:8000/api/user
Authorization: Bearer {votre_token}
```

### 4. Owner Register
```http
POST http://localhost:8000/api/owner/register
Authorization: Bearer {votre_token}
Content-Type: application/json

{
  "propertyType": "hotel",
  "propertyName": "Hôtel Luxe",
  "address": "123 Rue de Paris",
  "city": "Paris",
  "country": "France",
  "description": "Un magnifique hôtel"
}
```

## Vérification

1. Vérifier que la base de données existe :
```bash
mysql -u root -p -e "SHOW DATABASES LIKE 'luxestay';"
```

2. Vérifier les tables :
```bash
mysql -u root -p luxestay -e "SHOW TABLES;"
```

3. Vérifier les routes :
```bash
php artisan route:list
```

Vous devriez voir :
- `POST api/signup`
- `POST api/login`
- `POST api/logout`
- `GET api/user`
- `PUT api/user`
- `POST api/owner/register`
- `GET api/owner/properties`

## Problèmes courants

### Erreur CORS
Si vous avez des erreurs CORS, vérifiez :
- `.env` → `FRONTEND_URL=http://localhost:5173`
- `config/cors.php` → `allowed_origins` contient le frontend
- Redémarrer Laravel : `php artisan config:clear && php artisan serve`

### Erreur 404 sur les routes
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Erreur de token invalide
- Vérifier que `Authorization: Bearer {token}` est bien envoyé
- Vérifier que le token existe dans la table `personal_access_tokens`
