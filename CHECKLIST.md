# ✅ CHECKLIST D'INSTALLATION - LUXESTAY

## 📦 ÉTAPE 1 : BASE DE DONNÉES

- [ ] Créer la base de données `luxestay`
- [ ] Importer `database-complete.sql`
- [ ] Exécuter `verify-database.sql` pour vérifier
- [ ] Vérifier que `firebase_uid` est UNIQUE
- [ ] Vérifier que `role` a DEFAULT 'client'

**Commandes :**
```sql
CREATE DATABASE luxestay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luxestay;
SOURCE database-complete.sql;
SOURCE verify-database.sql;
```

---

## 🔥 ÉTAPE 2 : FIREBASE

- [ ] Télécharger le fichier credentials JSON
- [ ] Placer dans `backend/storage/firebase-credentials.json`
- [ ] Vérifier avec : `cat backend/storage/firebase-credentials.json`
- [ ] Ajouter dans `.env` : `FIREBASE_CREDENTIALS=firebase-credentials.json`

---

## 📚 ÉTAPE 3 : COMPOSER PACKAGES

- [ ] `composer require kreait/firebase-php`
- [ ] `composer require doctrine/dbal`
- [ ] `composer require fruitcake/laravel-cors`

**Commandes :**
```bash
cd backend
composer require kreait/firebase-php
composer require doctrine/dbal
composer require fruitcake/laravel-cors
```

---

## 🏗️ ÉTAPE 4 : CRÉER LES FICHIERS

### Models
- [ ] `app/Models/User.php`
- [ ] `app/Models/OwnerRequest.php`
- [ ] `app/Models/Property.php`
- [ ] `app/Models/Booking.php`

### Middleware
- [ ] `app/Http/Middleware/VerifyFirebaseToken.php`

### Controllers
- [ ] `app/Http/Controllers/Api/AuthController.php`
- [ ] `app/Http/Controllers/Api/OwnerController.php`

### Routes
- [ ] Modifier `routes/api.php`

### Config
- [ ] Vérifier `config/cors.php`
- [ ] Enregistrer le middleware dans `Kernel.php` (L10) ou `bootstrap/app.php` (L11)

---

## ⚙️ ÉTAPE 5 : CONFIGURATION

### .env
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=luxestay
DB_USERNAME=root
DB_PASSWORD=votre_password

FIREBASE_CREDENTIALS=firebase-credentials.json
```

### CORS
Vérifier dans `config/cors.php` :
```php
'allowed_origins' => [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
],
```

---

## 🧹 ÉTAPE 6 : NETTOYAGE CACHE

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
composer dump-autoload
```

---

## 🚀 ÉTAPE 7 : DÉMARRAGE

```bash
php artisan serve
```

Vous devriez voir :
```
INFO  Server running on [http://127.0.0.1:8000]
```

---

## 🔍 ÉTAPE 8 : VÉRIFICATION

### Vérifier les routes
```bash
php artisan route:list | grep api
```

**Vous devez voir :**
```
POST   api/auth/sync ................ firebase.auth
GET    api/auth/verify .............. firebase.auth
POST   api/owner/register ........... firebase.auth
GET    api/owner/check-status ....... firebase.auth
GET    api/owner/dashboard .......... firebase.auth
```

### Tester manuellement avec curl

**Test 1 : Sans token (doit échouer)**
```bash
curl -X POST http://localhost:8000/api/auth/sync
```
Réponse attendue :
```json
{"error":"Token manquant"}
```

**Test 2 : Avec un faux token (doit échouer)**
```bash
curl -X POST http://localhost:8000/api/auth/sync \
  -H "Authorization: Bearer fake-token"
```
Réponse attendue :
```json
{"error":"Token invalide ou expiré"}
```

---

## 🎯 ÉTAPE 9 : TESTER DEPUIS LE FRONTEND

1. Connectez-vous sur le frontend (http://localhost:5173)
2. Ouvrez la console du navigateur (F12)
3. Vérifiez les logs :
   - `🔍 Firebase Auth User: Connecté`
   - `🔑 Token Firebase: ...`
   - `📡 Synchronisation avec le backend MySQL...`
   - `✅ Synchronisation réussie ! Rôle: client`

4. Allez dans MySQL :
```sql
SELECT * FROM users;
```
Vous devriez voir votre utilisateur avec `firebase_uid` rempli.

---

## 🐛 DÉPANNAGE

### ❌ Firebase credentials not found
```bash
# Vérifier le chemin
ls -la backend/storage/firebase-credentials.json

# Vérifier .env
grep FIREBASE backend/.env
```

### ❌ Token invalide
- Vérifiez que le fichier JSON est le bon projet Firebase
- Vérifiez que Firebase Auth est activé dans la console

### ❌ CORS error
```bash
# Installer le package
composer require fruitcake/laravel-cors

# Vérifier config/cors.php
cat backend/config/cors.php
```

### ❌ Column 'first_name' cannot be null
```sql
ALTER TABLE users
MODIFY first_name VARCHAR(255) NULL,
MODIFY last_name VARCHAR(255) NULL;
```

### ❌ 500 Internal Server Error
```bash
# Voir les logs Laravel
tail -f backend/storage/logs/laravel.log

# Activer le mode debug
# Dans .env :
APP_DEBUG=true
```

---

## ✅ TOUT EST OK SI...

- [x] `php artisan serve` démarre sans erreur
- [x] `php artisan route:list` montre toutes les routes API
- [x] La connexion frontend → backend fonctionne
- [x] Les utilisateurs sont créés dans MySQL après connexion
- [x] Les logs Laravel montrent : `✅ User synchronized`
- [x] Le formulaire propriétaire enregistre dans `owner_requests`

---

## 📊 ARCHITECTURE FINALE

```
Frontend (React)
      ↓
Firebase Auth (Login)
      ↓
getIdToken()
      ↓
Bearer Token
      ↓
Laravel Middleware (VerifyFirebaseToken)
      ↓
Vérification Firebase Admin SDK
      ↓
Récupération firebase_uid
      ↓
AuthController::sync()
      ↓
MySQL (users table)
      ↓
OwnerController (demandes propriétaire)
      ↓
MySQL (owner_requests table)
      ↓
Admin approuve
      ↓
role = 'proprietaire'
      ↓
Dashboard propriétaire
```

---

## 🎓 PROCHAINES FONCTIONNALITÉS

1. **Panel Admin** pour approuver les demandes
2. **Gestion des propriétés** (CRUD complet)
3. **Système de réservation** avec calendrier
4. **Paiement** (Stripe/PayPal)
5. **Avis et notes** des propriétés
6. **Messagerie** propriétaire ↔ client
7. **Notifications** par email

---

## 📝 NOTES IMPORTANTES

⚠️ **Sécurité :**
- Ne jamais commiter `firebase-credentials.json`
- Ajouter dans `.gitignore`
- Utiliser HTTPS en production
- Limiter les CORS en production

⚠️ **Performance :**
- Ajouter des index sur les colonnes fréquemment recherchées
- Utiliser le cache Laravel pour les requêtes répétitives
- Optimiser les requêtes N+1 avec `with()`

⚠️ **Maintenance :**
- Logs à surveiller : `storage/logs/laravel.log`
- Sauvegardes automatiques de la BDD
- Monitoring des erreurs (Sentry, Bugsnag)
