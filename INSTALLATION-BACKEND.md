# 🚀 GUIDE D'INSTALLATION BACKEND - LUXESTAY

## 📋 Prérequis

- PHP 8.1+
- Composer
- MySQL/MariaDB
- Laravel 10 ou 11
- Compte Firebase avec credentials

---

## 1️⃣ BASE DE DONNÉES

### Étape 1 : Créer la base de données

```sql
CREATE DATABASE luxestay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Étape 2 : Importer le fichier SQL

Dans phpMyAdmin ou MySQL CLI :

```bash
mysql -u root -p luxestay < database-complete.sql
```

Ou copiez/collez le contenu de `database-complete.sql` dans phpMyAdmin.

### Étape 3 : Vérifier la structure

```sql
USE luxestay;
SHOW TABLES;

-- Vous devriez voir :
-- - users
-- - owner_requests
-- - properties
-- - bookings
-- - reviews (optionnel)
-- - favorites (optionnel)
```

---

## 2️⃣ FIREBASE CONFIGURATION

### Étape 1 : Obtenir les credentials Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. ⚙️ Paramètres du projet → Comptes de service
4. Cliquez sur **Générer une nouvelle clé privée**
5. Téléchargez le fichier JSON

### Étape 2 : Placer le fichier dans Laravel

```bash
# Dans votre dossier backend Laravel
mkdir -p storage
cp ~/Téléchargements/firebase-credentials-xxxxx.json storage/firebase-credentials.json
```

### Étape 3 : Configuration .env

Ajoutez dans `backend/.env` :

```env
FIREBASE_CREDENTIALS=firebase-credentials.json
```

---

## 3️⃣ INSTALLATION DES PACKAGES

```bash
cd backend

# Package Firebase pour PHP
composer require kreait/firebase-php

# Package pour modifier les colonnes (migrations)
composer require doctrine/dbal
```

---

## 4️⃣ CRÉER LES MODELS LARAVEL

### Model User.php

`backend/app/Models/User.php` :

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'firebase_uid',
        'email',
        'first_name',
        'last_name',
        'phone',
        'id_photo',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // Relations
    public function ownerRequests()
    {
        return $this->hasMany(OwnerRequest::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'owner_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
```

### Model OwnerRequest.php

`backend/app/Models/OwnerRequest.php` :

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OwnerRequest extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'phone',
        'address',
        'identity_document',
        'status',
        'admin_note',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### Model Property.php

`backend/app/Models/Property.php` :

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

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
```

### Model Booking.php

`backend/app/Models/Booking.php` :

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'property_id',
        'user_id',
        'check_in',
        'check_out',
        'guests',
        'total_price',
        'status',
        'notes',
    ];

    protected $casts = [
        'check_in' => 'date',
        'check_out' => 'date',
        'total_price' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

## 5️⃣ MIDDLEWARE FIREBASE

Créez `backend/app/Http/Middleware/VerifyFirebaseToken.php` :

(Voir le code dans firebase-auth-sync.md)

---

## 6️⃣ CONTROLLERS

Créez les controllers :

- `backend/app/Http/Controllers/Api/AuthController.php`
- `backend/app/Http/Controllers/Api/OwnerController.php`

(Voir le code dans firebase-auth-sync.md)

---

## 7️⃣ ROUTES API

`backend/routes/api.php` :

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OwnerController;

Route::middleware('firebase.auth')->group(function () {
    Route::post('/auth/sync', [AuthController::class, 'sync']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    
    Route::post('/owner/register', [OwnerController::class, 'register']);
    Route::get('/owner/check-status', [OwnerController::class, 'checkStatus']);
    Route::get('/owner/dashboard', [OwnerController::class, 'dashboard']);
});
```

---

## 8️⃣ ENREGISTRER LE MIDDLEWARE

### Laravel 10 ou antérieur

Dans `backend/app/Http/Kernel.php` :

```php
protected $middlewareAliases = [
    // ...
    'firebase.auth' => \App\Http\Middleware\VerifyFirebaseToken::class,
];
```

### Laravel 11

Dans `backend/bootstrap/app.php` :

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(...)
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'firebase.auth' => \App\Http\Middleware\VerifyFirebaseToken::class,
        ]);
    })
    ->withExceptions(...)
    ->create();
```

---

## 9️⃣ CORS CONFIGURATION

`backend/config/cors.php` :

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

---

## 🔟 DÉMARRAGE

```bash
# Vider le cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Vérifier les routes
php artisan route:list | grep api

# Démarrer le serveur
php artisan serve
```

Vous devriez voir :

```
Server running on [http://127.0.0.1:8000]
```

---

## ✅ VÉRIFICATION

### Test 1 : Routes disponibles

```bash
php artisan route:list
```

Vérifiez que vous voyez :

```
POST   api/auth/sync
GET    api/auth/verify
POST   api/owner/register
GET    api/owner/check-status
GET    api/owner/dashboard
```

### Test 2 : Base de données

```sql
SELECT * FROM users;
SELECT * FROM owner_requests;
SELECT * FROM properties;
```

### Test 3 : Firebase credentials

```bash
cat storage/firebase-credentials.json
```

Le fichier doit contenir votre configuration Firebase.

---

## 🐛 DÉPANNAGE

### Erreur : "Firebase credentials file not found"

```bash
# Vérifiez le chemin
ls -la storage/firebase-credentials.json

# Vérifiez .env
cat .env | grep FIREBASE
```

### Erreur : "Class VerifyFirebaseToken not found"

```bash
composer dump-autoload
php artisan cache:clear
```

### Erreur : "Column 'first_name' cannot be null"

```sql
ALTER TABLE users
MODIFY first_name VARCHAR(255) NULL,
MODIFY last_name VARCHAR(255) NULL;
```

### Erreur CORS

Vérifiez que `fruitcake/laravel-cors` est installé :

```bash
composer require fruitcake/laravel-cors
```

---

## 📚 PROCHAINES ÉTAPES

1. ✅ Tester la connexion Firebase depuis le frontend
2. ✅ Vérifier la synchronisation MySQL
3. ✅ Tester le formulaire propriétaire
4. ✅ Créer un admin pour approuver les demandes

---

## 🔐 SÉCURITÉ

- ❌ Ne jamais commiter `firebase-credentials.json`
- ✅ Ajouter dans `.gitignore` :

```gitignore
storage/firebase-credentials.json
```

- ✅ Utiliser des variables d'environnement pour les secrets
- ✅ Activer HTTPS en production
