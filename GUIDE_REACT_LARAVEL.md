# 🚀 Guide Complet : React + Laravel

## 📋 Table des matières

1. [Structure de la base de données](#structure-base)
2. [Backend Laravel](#backend-laravel)
3. [Frontend React](#frontend-react)
4. [Configuration CORS](#configuration-cors)
5. [Exemples complets](#exemples-complets)

---

## 📊 1. Structure de la base de données {#structure-base}

### Table `users` (Laravel par défaut)

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Si vous ajoutez des champs (exemple : phone, role)

```bash
php artisan make:migration add_fields_to_users_table
```

**Migration :**

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

## 🔧 2. Backend Laravel {#backend-laravel}

### Étape 1 : Créer le Controller

```bash
php artisan make:controller Api/UserController
```

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
     * Inscription (Register)
     * POST /api/register
     */
    public function register(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed', // password_confirmation
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Créer l'utilisateur
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
     * Connexion (Login)
     * POST /api/login
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

        // Vérifier les identifiants
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

    /**
     * Récupérer tous les utilisateurs
     * GET /api/users
     */
    public function index()
    {
        $users = User::all(['id', 'name', 'email', 'phone', 'role', 'created_at']);

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Récupérer un utilisateur par ID
     * GET /api/users/{id}
     */
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé'
            ], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Mettre à jour un utilisateur
     * PUT /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'password' => 'sometimes|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Mettre à jour les champs
        if ($request->has('name')) {
            $user->name = $request->name;
        }
        if ($request->has('email')) {
            $user->email = $request->email;
        }
        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
            ]
        ]);
    }

    /**
     * Supprimer un utilisateur
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'error' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé'
        ]);
    }
}
```

### Étape 2 : Modifier le Model User

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
        'password' => 'hashed', // Laravel 10+
    ];
}
```

### Étape 3 : Configurer les Routes

**Fichier : `routes/api.php`**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;

// Routes publiques
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Routes utilisateurs
Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
```

**Liste des routes :**

```bash
php artisan route:list
```

Vous devriez voir :

```
POST   /api/register
POST   /api/login
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

---

## 📱 3. Frontend React {#frontend-react}

### Étape 1 : Créer le service API

**Fichier : `src/services/userApi.ts`**

```typescript
const API_URL = 'http://localhost:8000/api';

export const userApi = {
  /**
   * Inscription
   */
  register: async (data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'inscription');
    }

    return response.json();
  },

  /**
   * Connexion
   */
  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la connexion');
    }

    return response.json();
  },

  /**
   * Récupérer tous les utilisateurs
   */
  getUsers: async () => {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    return response.json();
  },

  /**
   * Récupérer un utilisateur
   */
  getUser: async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Utilisateur non trouvé');
    }

    return response.json();
  },

  /**
   * Mettre à jour un utilisateur
   */
  updateUser: async (id: number, data: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour');
    }

    return response.json();
  },

  /**
   * Supprimer un utilisateur
   */
  deleteUser: async (id: number) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression');
    }

    return response.json();
  },
};
```

### Étape 2 : Créer le formulaire d'inscription

**Fichier : `src/components/RegisterForm.tsx`**

```typescript
import { useState } from 'react';
import { userApi } from '../services/userApi';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await userApi.register(formData);
      console.log('Utilisateur créé :', response);
      setSuccess(true);
      
      // Réinitialiser le formulaire
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Inscription</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Compte créé avec succès !
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Nom complet *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="Jean Dupont"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="jean@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Mot de passe *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Confirmer le mot de passe *
          </label>
          <input
            type="password"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  );
}
```

### Étape 3 : Créer le formulaire de connexion

**Fichier : `src/components/LoginForm.tsx`**

```typescript
import { useState } from 'react';
import { userApi } from '../services/userApi';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await userApi.login(formData);
      console.log('Connexion réussie :', response.user);
      
      // Stocker l'utilisateur dans localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Rediriger ou mettre à jour l'état global
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Connexion</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="jean@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}
```

### Étape 4 : Liste des utilisateurs

**Fichier : `src/components/UserList.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { userApi } from '../services/userApi';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  created_at: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userApi.getUsers();
      setUsers(response.users);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await userApi.deleteUser(id);
      // Recharger la liste
      loadUsers();
    } catch (err: any) {
      alert('Erreur : ' + err.message);
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="text-red-600">Erreur : {error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Liste des utilisateurs</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">ID</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Nom</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Téléphone</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Rôle</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm">{user.id}</td>
                <td className="px-6 py-4 text-sm">{user.name}</td>
                <td className="px-6 py-4 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                <td className="px-6 py-4 text-sm">{user.role || 'client'}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🔧 4. Configuration CORS {#configuration-cors}

**Fichier : `config/cors.php`** (Laravel)

```php
<?php

return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

**OU dans `.env` :**

```env
FRONTEND_URL=http://localhost:5173
```

Et dans `config/cors.php` :

```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
```

---

## 📝 5. Exemples complets {#exemples-complets}

### Exemple 1 : Inscription

**React** :
```typescript
await userApi.register({
  name: 'Jean Dupont',
  email: 'jean@example.com',
  password: 'password123',
  password_confirmation: 'password123',
  phone: '+33612345678'
});
```

**Laravel reçoit** :
```
POST /api/register
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "phone": "+33612345678"
}
```

**Laravel retourne** :
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

### Exemple 2 : Connexion

**React** :
```typescript
const response = await userApi.login({
  email: 'jean@example.com',
  password: 'password123'
});

localStorage.setItem('user', JSON.stringify(response.user));
```

**Laravel retourne** :
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

### Exemple 3 : Mise à jour

**React** :
```typescript
await userApi.updateUser(1, {
  phone: '+33687654321'
});
```

**Laravel reçoit** :
```
PUT /api/users/1
{
  "phone": "+33687654321"
}
```

---

## ✅ Checklist finale

### Backend Laravel
- [ ] Controller créé (`Api/UserController`)
- [ ] Model `User` configuré (fillable)
- [ ] Routes API configurées (`routes/api.php`)
- [ ] CORS configuré (`config/cors.php`)
- [ ] Base de données créée et migrée
- [ ] Serveur Laravel démarré (`php artisan serve`)

### Frontend React
- [ ] Service API créé (`userApi.ts`)
- [ ] Formulaires créés (Register, Login)
- [ ] Gestion des erreurs
- [ ] Tests effectués

---

## 🧪 Tests

### Test 1 : Backend avec Postman

```bash
# Register
POST http://localhost:8000/api/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

# Login
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# Get users
GET http://localhost:8000/api/users
```

### Test 2 : Frontend React

1. Démarrer Laravel : `php artisan serve`
2. Démarrer React : `npm run dev` ou `pnpm dev`
3. Ouvrir `http://localhost:5173`
4. Tester l'inscription
5. Tester la connexion
6. Vérifier dans MySQL : `SELECT * FROM users;`

---

## 🎯 Résumé

| Action | Route Laravel | Méthode | Frontend React |
|--------|--------------|---------|----------------|
| Inscription | `POST /api/register` | `register()` | `userApi.register()` |
| Connexion | `POST /api/login` | `login()` | `userApi.login()` |
| Liste users | `GET /api/users` | `index()` | `userApi.getUsers()` |
| Voir user | `GET /api/users/{id}` | `show()` | `userApi.getUser(id)` |
| Modifier | `PUT /api/users/{id}` | `update()` | `userApi.updateUser(id, data)` |
| Supprimer | `DELETE /api/users/{id}` | `destroy()` | `userApi.deleteUser(id)` |

---

**Vous avez maintenant un système complet React + Laravel fonctionnel !** 🎉
