Créez cette migration sur votre backend :

php artisan make:migration modify_users_table_nullable_fields
Puis dans le fichier créé :

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Rendre first_name et last_name nullable
            $table->string('first_name')->nullable()->change();
            $table->string('last_name')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable(false)->change();
            $table->string('last_name')->nullable(false)->change();
        });
    }
};
Exécutez :

composer require doctrine/dbal  # Pour modifier les colonnes
php artisan migrate
2. Middleware MINIMAL (vérifie juste le token)
backend/app/Http/Middleware/VerifyFirebaseToken.php :

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Auth as FirebaseAuth;
use Illuminate\Support\Facades\Log;

class VerifyFirebaseToken
{
    protected $auth;

    public function __construct()
    {
        try {
            $serviceAccountPath = storage_path(env('FIREBASE_CREDENTIALS', 'firebase-credentials.json'));
            
            if (!file_exists($serviceAccountPath)) {
                throw new \Exception("Firebase credentials file not found at: {$serviceAccountPath}");
            }

            $factory = (new Factory)->withServiceAccount($serviceAccountPath);
            $this->auth = $factory->createAuth();
        } catch (\Exception $e) {
            Log::error('❌ Firebase initialization failed:', ['error' => $e->getMessage()]);
        }
    }

    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token manquant'], 401);
        }

        try {
            // ✅ Vérifier le token Firebase
            $verifiedIdToken = $this->auth->verifyIdToken($token);
            
            // ✅ Récupérer les claims
            $uid = $verifiedIdToken->claims()->get('sub');
            $email = $verifiedIdToken->claims()->get('email') ?? ''; // Peut être null

            Log::info('🔐 Token Firebase vérifié:', [
                'uid' => $uid,
                'email' => $email,
            ]);

            // ✅ IMPORTANT: Stocker dans attributes (pas merge)
            $request->attributes->set('firebase_uid', $uid);
            $request->attributes->set('firebase_email', $email);

            // ✅ NE PAS créer l'utilisateur ici !
            // La création se fera dans AuthController::sync()

        } catch (\Exception $e) {
            Log::error('❌ Token Firebase invalide:', [
                'error' => $e->getMessage(),
            ]);
            
            return response()->json([
                'error' => 'Token invalide ou expiré',
                'message' => $e->getMessage()
            ], 401);
        }

        return $next($request);
    }
}
3. AuthController corrigé
backend/app/Http/Controllers/Api/AuthController.php :

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Synchronise un utilisateur Firebase avec MySQL
     * Route protégée par middleware firebase.auth
     */
    public function sync(Request $request)
    {
        try {
            // ✅ Récupérer depuis attributes (pas input)
            $firebaseUid = $request->attributes->get('firebase_uid');
            $firebaseEmail = $request->attributes->get('firebase_email');

            Log::info('🔥 Sync user request:', [
                'firebase_uid' => $firebaseUid,
                'firebase_email' => $firebaseEmail,
                'payload' => $request->all(),
            ]);

            // ✅ Récupérer les données (avec valeurs par défaut)
            $firstName = $request->input('firstName') ?? 'Utilisateur';
            $lastName = $request->input('lastName') ?? '';
            $phone = $request->input('phone') ?? '';
            $idPhoto = $request->input('idPhoto') ?? '';

            // ✅ Créer ou mettre à jour l'utilisateur
            $user = User::updateOrCreate(
                ['firebase_uid' => $firebaseUid],
                [
                    'email' => $firebaseEmail,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'phone' => $phone,
                    'id_photo' => $idPhoto,
                    // Le rôle est défini par défaut à 'client' dans la base
                ]
            );

            Log::info('✅ User synchronized:', [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role,
            ]);

            return response()->json([
                'success' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'phone' => $user->phone,
                    'idPhoto' => $user->id_photo,
                    'role' => $user->role,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error syncing user:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'Erreur lors de la synchronisation',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Vérifie le token Firebase et retourne les infos utilisateur
     */
    public function verify(Request $request)
    {
        try {
            $firebaseUid = $request->attributes->get('firebase_uid');

            // ✅ Chercher l'utilisateur (ne pas créer automatiquement)
            $user = User::where('firebase_uid', $firebaseUid)->first();

            if (!$user) {
                return response()->json([
                    'error' => 'Utilisateur non synchronisé. Appelez /auth/sync d\'abord.'
                ], 404);
            }

            return response()->json([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'phone' => $user->phone,
                    'idPhoto' => $user->id_photo,
                    'role' => $user->role,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error in verify:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur'], 500);
        }
    }
}
4. OwnerController corrigé
backend/app/Http/Controllers/Api/OwnerController.php :

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\OwnerRequest;
use App\Models\Property;
use App\Models\Booking;
use Illuminate\Support\Facades\Log;

class OwnerController extends Controller
{
    /**
     * Helper pour récupérer l'utilisateur authentifié
     */
    private function getAuthenticatedUser(Request $request)
    {
        $firebaseUid = $request->attributes->get('firebase_uid');
        $user = User::where('firebase_uid', $firebaseUid)->first();
        
        if (!$user) {
            abort(404, 'Utilisateur non trouvé. Synchronisez-vous d\'abord via /auth/sync');
        }
        
        return $user;
    }

    public function register(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            
            // Vérifier si une demande existe déjà
            $existingRequest = OwnerRequest::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'approved'])
                ->first();

            if ($existingRequest) {
                if ($existingRequest->status === 'approved') {
                    return response()->json([
                        'error' => 'Vous êtes déjà propriétaire'
                    ], 400);
                }
                
                return response()->json([
                    'error' => 'Vous avez déjà une demande en attente'
                ], 400);
            }

            // Créer la nouvelle demande
            $ownerRequest = OwnerRequest::create([
                'user_id' => $user->id,
                'company_name' => $request->companyName ?? null,
                'phone' => $request->phone ?? $user->phone,
                'address' => $request->address ?? null,
                'identity_document' => $request->identityDocument ?? null,
                'status' => 'pending',
            ]);

            Log::info('✅ Owner request created:', [
                'user_id' => $user->id,
                'request_id' => $ownerRequest->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Votre demande a été envoyée avec succès.',
                'request' => [
                    'id' => $ownerRequest->id,
                    'status' => $ownerRequest->status,
                    'createdAt' => $ownerRequest->created_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error creating owner request:', [
                'message' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Erreur lors de la création de la demande',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function checkStatus(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);

            $ownerRequest = OwnerRequest::where('user_id', $user->id)
                ->latest()
                ->first();

            if (!$ownerRequest) {
                return response()->json([
                    'hasRequest' => false,
                    'status' => null,
                ]);
            }

            return response()->json([
                'hasRequest' => true,
                'status' => $ownerRequest->status,
                'request' => [
                    'id' => $ownerRequest->id,
                    'companyName' => $ownerRequest->company_name,
                    'phone' => $ownerRequest->phone,
                    'address' => $ownerRequest->address,
                    'status' => $ownerRequest->status,
                    'adminNote' => $ownerRequest->admin_note,
                    'createdAt' => $ownerRequest->created_at,
                    'updatedAt' => $ownerRequest->updated_at,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error checking status:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur'], 500);
        }
    }

    public function dashboard(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);

            // Vérifier si approuvé
            $ownerRequest = OwnerRequest::where('user_id', $user->id)
                ->where('status', 'approved')
                ->first();

            if (!$ownerRequest && $user->role !== 'proprietaire') {
                return response()->json([
                    'error' => 'Accès refusé. Votre demande n\'a pas encore été approuvée.'
                ], 403);
            }

            // Si approuvé mais rôle pas encore changé
            if ($ownerRequest && $user->role !== 'proprietaire') {
                $user->role = 'proprietaire';
                $user->save();
            }

            // Récupérer les propriétés
            $properties = Property::where('user_id', $user->id)->get();
            
            // Stats
            $totalProperties = $properties->count();
            $activeProperties = $properties->where('status', 'active')->count();
            
            $propertyIds = $properties->pluck('id');
            $totalBookings = Booking::whereIn('property_id', $propertyIds)->count();
            $pendingBookings = Booking::whereIn('property_id', $propertyIds)
                ->where('status', 'pending')
                ->count();

            return response()->json([
                'stats' => [
                    'totalProperties' => $totalProperties,
                    'activeProperties' => $activeProperties,
                    'totalBookings' => $totalBookings,
                    'pendingBookings' => $pendingBookings,
                ],
                'properties' => $properties,
            ]);

        } catch (\Exception $e) {
            Log::error('❌ Error in dashboard:', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'Erreur'], 500);
        }
    }
}
5. Enregistrer le middleware
Si Laravel 10 ou antérieur :
Dans backend/app/Http/Kernel.php :

protected $middlewareAliases = [
    // ...
    'firebase.auth' => \App\Http\Middleware\VerifyFirebaseToken::class,
];
Si Laravel 11 :
Dans backend/bootstrap/app.php :

<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'firebase.auth' => \App\Http\Middleware\VerifyFirebaseToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
6. Routes
backend/routes/api.php :

<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OwnerController;

// Routes protégées par Firebase Auth
Route::middleware('firebase.auth')->group(function () {
    // Auth
    Route::post('/auth/sync', [AuthController::class, 'sync']);
    Route::get('/auth/verify', [AuthController::class, 'verify']);
    
    // Owner
    Route::post('/owner/register', [OwnerController::class, 'register']);
    Route::get('/owner/check-status', [OwnerController::class, 'checkStatus']);
    Route::get('/owner/dashboard', [OwnerController::class, 'dashboard']);
});
7. Configuration
Dans .env :

FIREBASE_CREDENTIALS=firebase-credentials.json
Placez votre fichier JSON dans backend/storage/firebase-credentials.json

8. Installation
cd backend
composer require kreait/firebase-php
composer require doctrine/dbal  # Pour modifier les colonnes
php artisan migrate
php artisan cache:clear
php artisan config:clear
php artisan serve

Cette version est beaucoup plus propre. Je vois seulement quelques derniers ajustements techniques avant de l'appliquer.

1. Ajouter une contrainte UNIQUE sur firebase_uid

Si ce n'est pas déjà fait :

ALTER TABLE users
ADD UNIQUE KEY users_firebase_uid_unique (firebase_uid);

ou via migration Laravel :

$table->string('firebase_uid')->unique()->change();

Sinon deux utilisateurs pourraient théoriquement être créés avec le même UID.

2. Vérifier que role a une valeur par défaut

Comme ton updateOrCreate() ne renseigne plus le rôle :

User::updateOrCreate(...)

la colonne devrait avoir :

role VARCHAR(50) NOT NULL DEFAULT 'client'

ou en migration :

$table->string('role')->default('client');

Sinon tu risques :

SQLSTATE[23000]
Column 'role' cannot be null
3. Corriger la récupération du fichier Firebase

Tu as :

$serviceAccountPath = storage_path(
    env('FIREBASE_CREDENTIALS', 'firebase-credentials.json')
);

et dans .env :

FIREBASE_CREDENTIALS=firebase-credentials.json

ce qui donnera :

storage/firebase-credentials.json

C'est correct.

Mais si un jour tu mets :

FIREBASE_CREDENTIALS=storage/firebase-credentials.json

tu obtiendras :

storage/storage/firebase-credentials.json

Je recommande donc :

FIREBASE_CREDENTIALS=firebase-credentials.json

et rien d'autre.

4. Éviter les recherches répétées du même utilisateur

Actuellement :

$firebaseUid = $request->attributes->get('firebase_uid');

$user = User::where('firebase_uid', $firebaseUid)->first();

est exécuté dans plusieurs méthodes.

Tu peux directement stocker l'objet utilisateur dans le middleware après vérification :

$user = User::where('firebase_uid', $uid)->first();

$request->attributes->set('user_model', $user);

Puis :

$user = $request->attributes->get('user_model');

Cela évite plusieurs requêtes SQL.

5. Attention à la colonne id_photo

Tu utilises :

'id_photo' => $idPhoto,

Assure-toi que la colonne existe réellement :

SHOW COLUMNS FROM users;

Car dans les erreurs précédentes que tu m'avais montrées, je n'avais pas vu cette colonne.

Si elle n'existe pas :

ALTER TABLE users
ADD COLUMN id_photo VARCHAR(255) NULL;
6. Dashboard propriétaire

Tu as encore :

Property::where('user_id', $user->id)

Je recommande plutôt :

owner_id

dans la table properties.

Exemple :

Property::where('owner_id', $user->id)

Cela rend le modèle plus clair :

user_id = voyageur qui réserve
owner_id = propriétaire du logement
7. Synchronisation après connexion Firebase

Le point le plus important pour ton frontend.

Après :

await signInWithEmailAndPassword(...)

ou

await signInWithPopup(...)

tu dois appeler :

POST /api/auth/sync

avec le token Firebase.

Sinon l'utilisateur existe dans Firebase mais pas encore dans MySQL, et les routes :

/owner/register
/owner/check-status
/owner/dashboard

retourneront :

{
  "error": "Utilisateur non trouvé"
}
Vérification finale

Avant de déployer, exécute :

php artisan route:list

et vérifie que tu vois :

POST  api/auth/sync
GET   api/auth/verify
POST  api/owner/register
GET   api/owner/check-status
GET   api/owner/dashboard