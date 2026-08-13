# Profile Laravel - Setup

## Frontend

**Fichier créé :** `src/app/pages/ProfileLaravel.tsx`

**Ajouter la route :**
```typescript
{
  path: '/profile-laravel',
  element: <ProfileLaravel />,
}
```

**Aller sur :** `http://localhost:5173/profile-laravel`

---

## Backend Laravel

### 1. Migration (ajouter avatar, phone, role)

```bash
php artisan make:migration add_avatar_phone_role_to_users_table
```

**Code :** voir `backend_migration_avatar.php`

```bash
php artisan migrate
```

### 2. Controller (méthode update)

**Code :** voir `backend_controller_update.php`

**Fichier :** `app/Http/Controllers/Api/UserController.php`

### 3. Route

**`routes/api.php` :**
```php
Route::put('/users/{id}', [UserController::class, 'update']);
```

### 4. Model User

**`app/Models/User.php` :**
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'phone',
    'avatar',
    'role',
];
```

---

## Test

1. **S'inscrire** : `/signup-laravel`
2. **Se connecter** : `/login-laravel`
3. **Modifier profil** : `/profile-laravel`
4. Changer nom/email/phone/avatar
5. Sauvegarder
6. Vérifier dans MySQL : `SELECT * FROM users;`

---

## Flow

```
ProfileLaravel.tsx
    ↓
localStorage.getItem("user")
    ↓
Affiche formulaire
    ↓
handleSubmit
    ↓
userApi.updateUser(id, data)
    ↓
PUT http://localhost:8000/api/users/{id}
    ↓
Laravel UserController@update
    ↓
Validation
    ↓
Update MySQL
    ↓
Return user
    ↓
localStorage.setItem("user", updatedUser)
    ↓
Succès affiché
```

---

**C'est prêt.**
