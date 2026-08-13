# 🔐 Setup Laravel Sanctum UNIQUEMENT (sans Firebase)

Cette version utilise **uniquement Laravel Sanctum** pour l'authentification. Firebase a été complètement retiré.

## ✅ Ce qui a été modifié

### 1. **Nouveau contexte d'authentification**

`src/app/context/AuthContext.tsx` remplace `UserContext.tsx`

```typescript
import { useAuth } from '../context/AuthContext';

const { user, login, signup, logout, isOwner, isAdmin } = useAuth();
```

### 2. **Pages adaptées**

- ✅ **Login.tsx** → Utilise `sanctumApi.login()`
- ✅ **SignUp.tsx** → Utilise `sanctumApi.signup()`
- ✅ **Profile.tsx** → Récupère/met à jour via `sanctumApi`
- ✅ **OwnerRegister.tsx** → Envoie directement à Laravel

### 3. **Navbar mise à jour**

- Affiche `user.name`, `user.email`, `user.avatar`
- Affiche le rôle de l'utilisateur
- Fonctions logout adaptées

### 4. **Plus de dépendance Firebase**

Firebase n'est plus utilisé. Tout passe par Laravel Sanctum.

## 🚀 Installation Backend Laravel

### Étape 1 : Créer le projet Laravel

```bash
composer create-project laravel/laravel backend
cd backend
```

### Étape 2 : Installer les dépendances

```bash
composer require laravel/sanctum
composer require laravel/socialite
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Étape 3 : Configuration de la base de données

Modifier `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=luxestay
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Étape 4 : Créer les migrations

```bash
php artisan make:migration add_fields_to_users_table
```

**Migration** (`database/migrations/xxxx_add_fields_to_users_table.php`) :

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

```bash
php artisan migrate
```

### Étape 5 : Créer le AuthController

`app/Http/Controllers/AuthController.php` :

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

### Étape 6 : Créer OwnerController

`app/Http/Controllers/OwnerController.php` :

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
        $user = $request->user();

        // Mettre à jour le rôle
        $user->update(['role' => 'proprietaire']);

        return response()->json([
            'message' => 'Enregistré comme propriétaire',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ]
        ]);
    }
}
```

### Étape 7 : Configurer les routes

`routes/api.php` :

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
});
```

### Étape 8 : Configurer CORS

`config/cors.php` :

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

### Étape 9 : Model User

`app/Models/User.php` :

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
}
```

### Étape 10 : Démarrer le serveur

```bash
php artisan serve
```

## 🧪 Tests

### Test Signup

```bash
POST http://localhost:8000/api/signup
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "phone": "+33612345678"
}
```

### Test Login

```bash
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "password123"
}
```

### Test Get User

```bash
GET http://localhost:8000/api/user
Authorization: Bearer {token}
```

## ✅ Checklist

- [ ] Laravel installé
- [ ] Sanctum installé
- [ ] Migrations exécutées
- [ ] AuthController créé
- [ ] OwnerController créé
- [ ] Routes configurées
- [ ] CORS configuré
- [ ] Serveur Laravel démarré
- [ ] Tests réussis

---

**Vous avez maintenant une application 100% Laravel Sanctum sans Firebase !**
