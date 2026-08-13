# 🔐 Guide Laravel Sanctum - Authentification API

Ce guide vous montre comment implémenter une authentification API complète avec Laravel Sanctum.

## 📦 Installation

```bash
# 1. Créer le projet Laravel
composer create-project laravel/laravel backend
cd backend

# 2. Installer Sanctum
composer require laravel/sanctum

# 3. Installer Socialite (pour Google/Facebook)
composer require laravel/socialite

# 4. Publier la configuration Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 5. Exécuter les migrations
php artisan migrate
```

## ⚙️ Configuration

### 1. Model User (`app/Models/User.php`)

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
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

### 2. Migration users (ajouter ces champs)

```php
// database/migrations/xxxx_add_social_fields_to_users_table.php
Schema::table('users', function (Blueprint $table) {
    $table->string('provider')->nullable();
    $table->string('provider_id')->nullable();
    $table->string('avatar')->nullable();
    $table->string('phone')->nullable();
    $table->enum('role', ['admin', 'proprietaire', 'client'])->default('client');
});
```

### 3. Configuration Sanctum (`config/sanctum.php`)

```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:5173,127.0.0.1,127.0.0.1:8000,::1',
    Sanctum::currentApplicationUrlWithPort()
))),
```

### 4. Configuration CORS (`config/cors.php`)

```php
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

### 5. Variables d'environnement (`.env`)

```env
FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/api/auth/facebook/callback
```

### 6. Configuration Socialite (`config/services.php`)

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],

'facebook' => [
    'client_id' => env('FACEBOOK_CLIENT_ID'),
    'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    'redirect' => env('FACEBOOK_REDIRECT_URI'),
],
```

## 🛣️ Routes API (`routes/api.php`)

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

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
});
```

## 🎯 Controller Auth (`app/Http/Controllers/AuthController.php`)

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
     * Inscription avec email/password
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
     * Connexion avec email/password
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
     * Récupérer l'utilisateur authentifié
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
     * Mettre à jour le profil utilisateur
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
     * Rediriger vers le provider social
     */
    public function redirectToProvider($provider)
    {
        if (!in_array($provider, ['google', 'facebook'])) {
            return response()->json(['error' => 'Provider non supporté'], 400);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Callback du provider social
     */
    public function handleProviderCallback($provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();

            // Chercher l'utilisateur par provider_id
            $user = User::where('provider', $provider)
                        ->where('provider_id', $socialUser->id)
                        ->first();

            if (!$user) {
                // Chercher par email
                $user = User::where('email', $socialUser->email)->first();

                if ($user) {
                    // Lier le compte existant au provider
                    $user->update([
                        'provider' => $provider,
                        'provider_id' => $socialUser->id,
                        'avatar' => $socialUser->avatar ?? $user->avatar,
                    ]);
                } else {
                    // Créer un nouveau compte
                    $user = User::create([
                        'name' => $socialUser->name,
                        'email' => $socialUser->email,
                        'provider' => $provider,
                        'provider_id' => $socialUser->id,
                        'avatar' => $socialUser->avatar,
                        'password' => Hash::make(uniqid()), // Mot de passe aléatoire
                    ]);
                }
            } else {
                // Mettre à jour l'avatar si disponible
                if ($socialUser->avatar) {
                    $user->update(['avatar' => $socialUser->avatar]);
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Rediriger vers le frontend avec le token
            return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=social_auth_failed');
        }
    }
}
```

## ⚛️ Frontend React

### 1. Service API Sanctum (`src/app/services/sanctumApi.ts`)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const sanctumApi = {
  // Inscription
  signup: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/signup', data);
    return response.data;
  },

  // Connexion
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/login', data);
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  // Récupérer l'utilisateur
  getUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  // Mettre à jour le profil
  updateUser: async (data: { name?: string; email?: string; phone?: string; avatar?: string }) => {
    const response = await api.put('/user', data);
    return response.data;
  },

  // Social login
  socialLogin: (provider: 'google' | 'facebook') => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  },
};
```

### 2. Utilisation dans les composants

```typescript
// Signup
const handleSignup = async () => {
  try {
    const { token, user } = await sanctumApi.signup({
      name: 'Jean Dupont',
      email: 'jean@example.com',
      password: 'password123',
    });

    localStorage.setItem('auth_token', token);
    // Rediriger ou mettre à jour le contexte
  } catch (error) {
    console.error('Erreur signup:', error);
  }
};

// Login
const handleLogin = async () => {
  try {
    const { token, user } = await sanctumApi.login({
      email: 'jean@example.com',
      password: 'password123',
    });

    localStorage.setItem('auth_token', token);
  } catch (error) {
    console.error('Erreur login:', error);
  }
};

// Social Login
const handleGoogleLogin = () => {
  sanctumApi.socialLogin('google');
};

// Logout
const handleLogout = async () => {
  try {
    await sanctumApi.logout();
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Erreur logout:', error);
  }
};
```

## 🔄 Callback Social Login

Créer une page `/auth/callback` dans React :

```typescript
// src/app/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('auth_token', token);
      navigate('/');
    } else if (error) {
      navigate('/login?error=' + error);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Connexion en cours...</p>
    </div>
  );
}
```

## ✅ Checklist

### Backend
- [ ] Laravel Sanctum installé
- [ ] Socialite installé
- [ ] Migrations exécutées
- [ ] Configuration CORS
- [ ] Variables d'environnement configurées
- [ ] Routes API définies
- [ ] AuthController créé
- [ ] Google OAuth configuré (Console Cloud)
- [ ] Facebook OAuth configuré (App Facebook)

### Frontend
- [ ] Service API Sanctum créé
- [ ] Token stocké dans localStorage
- [ ] Intercepteurs axios configurés
- [ ] Page AuthCallback créée
- [ ] Routes configurées

## 🧪 Tests

```bash
# Signup
POST http://localhost:8000/api/signup
Content-Type: application/json

{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123"
}

# Login
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "jean@example.com",
  "password": "password123"
}

# Get User (avec token)
GET http://localhost:8000/api/user
Authorization: Bearer {token}

# Logout
POST http://localhost:8000/api/logout
Authorization: Bearer {token}
```

## 🚨 Sécurité

1. **Toujours utiliser HTTPS en production**
2. **Configurer correctement CORS**
3. **Valider toutes les entrées**
4. **Rate limiting sur les endpoints sensibles**
5. **Rotation des tokens** (expiration)

---

**Avantage Sanctum** : Tokens API simples, pas de JWT complexe, parfait pour SPA !
