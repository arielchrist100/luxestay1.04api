# 📝 Formulaires SignUp et Login pour Laravel

## 📁 Fichiers créés

1. **`src/app/services/userApi.ts`** - Service API pour Laravel
2. **`src/app/pages/SignUpLaravel.tsx`** - Formulaire d'inscription
3. **`src/app/pages/LoginLaravel.tsx`** - Formulaire de connexion

---

## 🚀 Utilisation

### Étape 1 : Ajouter les routes

**Fichier : `src/app/routes.ts`** (ou où vous définissez vos routes)

```typescript
import SignUpLaravel from './pages/SignUpLaravel';
import LoginLaravel from './pages/LoginLaravel';

// Ajouter ces routes
{
  path: '/signup-laravel',
  element: <SignUpLaravel />,
},
{
  path: '/login-laravel',
  element: <LoginLaravel />,
}
```

### Étape 2 : Tester

1. Démarrer Laravel :
   ```bash
   cd backend
   php artisan serve
   ```

2. Démarrer React :
   ```bash
   pnpm dev
   ```

3. Aller sur :
   - **Inscription** : `http://localhost:5173/signup-laravel`
   - **Connexion** : `http://localhost:5173/login-laravel`

---

## 📊 Comment ça fonctionne

### Inscription (SignUpLaravel)

**Frontend envoie :**
```javascript
POST http://localhost:8000/api/register
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+33612345678"
}
```

**Laravel retourne :**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "role": "client"
  }
}
```

**Frontend stocke :**
```javascript
localStorage.setItem("user", JSON.stringify(res.user));
```

**Puis redirige vers :** `/`

---

### Connexion (LoginLaravel)

**Frontend envoie :**
```javascript
POST http://localhost:8000/api/login
{
  "email": "jean@example.com",
  "password": "password123"
}
```

**Laravel retourne :**
```json
{
  "message": "Connexion réussie",
  "user": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean@example.com",
    "phone": "+33612345678",
    "role": "client"
  }
}
```

**Frontend stocke :**
```javascript
localStorage.setItem("user", JSON.stringify(res.user));
```

**Puis redirige vers :** `/`

---

## 🔧 Backend Laravel nécessaire

### 1. Controller

**Fichier : `app/Http/Controllers/Api/UserController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Inscription
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role ?? 'client',
            ]
        ], 201);
    }

    /**
     * Connexion
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'error' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        return response()->json([
            'message' => 'Connexion réussie',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
                'role' => $user->role ?? 'client',
            ]
        ]);
    }
}
```

### 2. Routes

**Fichier : `routes/api.php`**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
```

### 3. CORS

**Fichier : `config/cors.php`**

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 4. Model User

**Fichier : `app/Models/User.php`**

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
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

### 5. Migration (si vous ajoutez phone et role)

```bash
php artisan make:migration add_phone_and_role_to_users_table
```

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
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['admin', 'proprietaire', 'client'])
                  ->default('client')
                  ->after('phone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role']);
        });
    }
};
```

```bash
php artisan migrate
```

---

## 🎯 Gestion de l'utilisateur connecté

### Récupérer l'utilisateur

```typescript
const user = JSON.parse(localStorage.getItem("user") || "null");

if (user) {
  console.log("Utilisateur connecté :", user.name);
  console.log("Email :", user.email);
  console.log("Rôle :", user.role);
}
```

### Déconnexion

```typescript
const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/login-laravel");
};
```

### Protéger une route

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export function ProtectedPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    
    if (!user) {
      navigate("/login-laravel");
    }
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div>
      <h1>Bienvenue {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Rôle: {user.role}</p>
    </div>
  );
}
```

---

## ✅ Checklist

### Backend Laravel
- [ ] Controller `UserController` créé
- [ ] Routes `/api/register` et `/api/login` configurées
- [ ] CORS configuré pour `http://localhost:5173`
- [ ] Migration exécutée (phone et role ajoutés)
- [ ] Serveur Laravel démarré (`php artisan serve`)

### Frontend React
- [ ] Service `userApi.ts` créé
- [ ] Composant `SignUpLaravel.tsx` créé
- [ ] Composant `LoginLaravel.tsx` créé
- [ ] Routes ajoutées (`/signup-laravel`, `/login-laravel`)
- [ ] Tests effectués

---

## 🧪 Tests

### Test 1 : Inscription

1. Aller sur `http://localhost:5173/signup-laravel`
2. Remplir le formulaire
3. Cliquer sur "S'inscrire"
4. Vérifier dans la console : `✅ Inscription réussie`
5. Vérifier dans MySQL : `SELECT * FROM users;`
6. Vérifier dans localStorage : `localStorage.getItem("user")`

### Test 2 : Connexion

1. Aller sur `http://localhost:5173/login-laravel`
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"
4. Vérifier dans la console : `✅ Connexion réussie`
5. Vérifier dans localStorage : `localStorage.getItem("user")`

### Test 3 : Erreurs de validation

1. Essayer de s'inscrire avec un email déjà utilisé
2. Vérifier que l'erreur s'affiche : "The email has already been taken."
3. Essayer de se connecter avec un mauvais mot de passe
4. Vérifier que l'erreur s'affiche : "Email ou mot de passe incorrect"

---

## 🎨 Personnalisation du style

Les formulaires utilisent des styles inline simples. Pour utiliser Tailwind CSS à la place :

```typescript
// Remplacer
<input
  style={{
    padding: "10px 15px",
    border: "1px solid #ddd",
    borderRadius: 8,
  }}
/>

// Par
<input
  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
/>
```

---

## 🔗 Liens utiles

- **Guide complet** : `GUIDE_REACT_LARAVEL.md`
- **Documentation Laravel** : https://laravel.com/docs/validation
- **Documentation React Router** : https://reactrouter.com/

---

**Vos formulaires SignUp et Login sont prêts !** 🎉
