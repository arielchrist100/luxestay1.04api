# 🔐 Flow d'authentification Firebase → Laravel

Ce document décrit le flux complet d'authentification de l'application.

## 🎯 Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Firebase  │         │     React    │         │   Laravel   │
│    Auth     │◄────────│   Frontend   │────────►│   Backend   │
│   (Login)   │  Token  │ (UserContext)│  Token  │   (MySQL)   │
└─────────────┘         └──────────────┘         └─────────────┘
```

## ✅ Flow Complet (SIGNUP)

### 1️⃣ **Utilisateur remplit le formulaire d'inscription**

```typescript
// src/app/pages/SignUp.tsx
handleSubmit() {
  // Validation des mots de passe
  
  // 🔥 Créer l'utilisateur dans Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );
  
  // 🔥 Mettre à jour le profil Firebase
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`
  });
  
  // 🔥 Synchroniser avec Laravel
  await apiService.syncUser({
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    phone: formData.phone,
  });
}
```

### 2️⃣ **Firebase crée le compte**

- Firebase Authentication crée l'utilisateur
- Retourne un `User` avec un `uid` (Firebase UID)
- L'utilisateur est automatiquement connecté

### 3️⃣ **UserContext détecte la connexion**

```typescript
// src/app/context/UserContext.tsx
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      // 🔥 Utilisateur connecté via Firebase
      // On récupère le token Firebase
      const token = await firebaseUser.getIdToken();
      
      // 🔥 On vérifie auprès de Laravel
      try {
        const response = await apiService.verifyAuth();
        // ✅ Utilisateur existe dans Laravel
        setUser(response.user);
      } catch (error) {
        // ❌ Utilisateur n'existe pas dans Laravel (404)
        // 🔥 On le crée automatiquement
        const syncResponse = await apiService.syncUser({...});
        setUser(syncResponse.user);
      }
    }
  });
}, []);
```

### 4️⃣ **apiService envoie le token à Laravel**

```typescript
// src/app/services/api.ts
private async getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  const token = await user.getIdToken();
  return token;
}

private async request(endpoint, options) {
  const token = await this.getAuthToken();
  
  headers['Authorization'] = `Bearer ${token}`; // 🔥 IMPORTANT
  
  const response = await fetch(API_URL + endpoint, { headers });
}
```

### 5️⃣ **Laravel reçoit le token**

```php
// app/Http/Middleware/FirebaseAuthMiddleware.php
public function handle(Request $request, Closure $next)
{
    // 🔥 Récupérer le token
    $token = $request->bearerToken();
    
    // 🔥 Vérifier avec Firebase Admin SDK
    $verifiedIdToken = $this->auth->verifyIdToken($token);
    $uid = $verifiedIdToken->claims()->get('sub');
    
    // 🔥 Chercher l'utilisateur dans MySQL
    $user = User::where('firebase_uid', $uid)->first();
    
    if (!$user) {
        return response()->json(['error' => 'User not found'], 404);
    }
    
    return $next($request);
}
```

### 6️⃣ **Laravel crée/met à jour l'utilisateur**

```php
// app/Http/Controllers/AuthController.php
public function syncUser(Request $request)
{
    $authenticatedUser = $request->input('authenticated_user');
    
    // 🔥 Créer ou mettre à jour l'utilisateur
    $user = User::updateOrCreate(
        ['firebase_uid' => $authenticatedUser->firebase_uid],
        [
            'email' => $request->email,
            'first_name' => $request->firstName,
            'last_name' => $request->lastName,
            'phone' => $request->phone,
        ]
    );
    
    return response()->json(['user' => $user]);
}
```

## ✅ Flow Complet (LOGIN)

### 1️⃣ **Utilisateur se connecte**

```typescript
// src/app/pages/Login.tsx
handleSubmit() {
  // 🔥 Connexion Firebase uniquement
  await signInWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );
  
  // ✅ Le UserContext fait le reste automatiquement
  navigate('/');
}
```

### 2️⃣ **Firebase authentifie**

- Firebase vérifie email/password
- Retourne l'utilisateur Firebase
- Déclenche `onAuthStateChanged`

### 3️⃣ **UserContext synchronise automatiquement**

```typescript
// Le même flow que pour SIGNUP
onAuthStateChanged(async (firebaseUser) => {
  if (firebaseUser) {
    try {
      // 🔥 Vérifier auprès de Laravel
      const response = await apiService.verifyAuth();
      setUser(response.user);
    } catch (error) {
      // Si 404, créer l'utilisateur automatiquement
      const syncResponse = await apiService.syncUser({...});
      setUser(syncResponse.user);
    }
  }
});
```

### 4️⃣ **Laravel retourne les données utilisateur**

```php
public function verifyAuth(Request $request)
{
    $token = $request->bearerToken();
    $verifiedIdToken = $this->auth->verifyIdToken($token);
    $uid = $verifiedIdToken->claims()->get('sub');
    
    $user = User::where('firebase_uid', $uid)->first();
    
    return response()->json([
        'user' => [
            'id' => $user->id,
            'firebase_uid' => $user->firebase_uid,
            'email' => $user->email,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'phone' => $user->phone,
            'role' => $user->role,  // 🔥 IMPORTANT pour les permissions
            'idPhoto' => $user->id_photo,
        ]
    ]);
}
```

## ✅ Flow Connexion Sociale (Google/Facebook)

```typescript
// src/app/pages/Login.tsx
handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  
  // 🔥 Connexion Google
  await signInWithPopup(auth, provider);
  
  // ✅ Le UserContext fait le reste
  // Firebase retourne automatiquement displayName, email, photoURL
  // UserContext extrait firstName/lastName et synchronise avec Laravel
}
```

## 🔑 Points Clés

### ✅ CE QUI EST AUTOMATIQUE

1. **Firebase Auth** → Gère l'authentification
2. **UserContext** → Écoute `onAuthStateChanged`
3. **Token Firebase** → Récupéré et envoyé automatiquement à Laravel
4. **Synchronisation Laravel** → Automatique si l'utilisateur n'existe pas (404)

### ✅ CE QUI DOIT ÊTRE FAIT MANUELLEMENT

1. **Configuration Firebase** → Credentials dans `.env`
2. **Configuration Laravel** → Firebase Admin SDK + credentials JSON
3. **Base de données** → Créer les tables (migrations)
4. **CORS** → Configurer Laravel pour accepter les requêtes React

## 📝 Checklist de vérification

### Frontend (React)

- [x] Firebase Auth configuré dans `config/firebase.ts`
- [x] UserContext écoute `onAuthStateChanged`
- [x] apiService récupère automatiquement le token Firebase
- [x] apiService envoie `Authorization: Bearer <token>`
- [x] Login.tsx fait uniquement `signInWithEmailAndPassword`
- [x] SignUp.tsx fait `createUserWithEmailAndPassword` + `syncUser`

### Backend (Laravel)

- [ ] Firebase Admin SDK installé (`kreait/firebase-php`)
- [ ] Credentials Firebase configurés (`storage/firebase.json`)
- [ ] Middleware `FirebaseAuthMiddleware` créé
- [ ] Routes API protégées par le middleware
- [ ] Controller `AuthController` avec `verifyAuth()` et `syncUser()`
- [ ] Base de données avec `users.firebase_uid` (unique)

### Tests

- [ ] Signup email/password → Utilisateur créé dans MySQL
- [ ] Login email/password → Token vérifié, données retournées
- [ ] Login Google → Utilisateur créé automatiquement dans MySQL
- [ ] Login Facebook → Utilisateur créé automatiquement dans MySQL
- [ ] Token invalide → Erreur 401
- [ ] Utilisateur non trouvé → Création automatique

## 🚨 Erreurs Courantes

### ❌ "Token non fourni"

**Cause** : Le token Firebase n'est pas envoyé dans les headers

**Solution** : Vérifier que `apiService.getAuthToken()` fonctionne

### ❌ "Token invalide"

**Cause** : Laravel ne peut pas vérifier le token avec Firebase Admin SDK

**Solution** : Vérifier les credentials Firebase dans Laravel

### ❌ "User not found (404)"

**Cause** : L'utilisateur existe dans Firebase mais pas dans MySQL

**Solution** : Le UserContext devrait créer automatiquement l'utilisateur (vérifier la logique)

### ❌ "CORS error"

**Cause** : Laravel n'accepte pas les requêtes de React

**Solution** : Configurer CORS dans `config/cors.php`

## 📊 Diagramme de séquence complet

```
User          React           Firebase        Laravel         MySQL
  │             │                │               │               │
  │─signup()───►│                │               │               │
  │             │                │               │               │
  │             │─createUser()──►│               │               │
  │             │◄──user+token───│               │               │
  │             │                │               │               │
  │             │─syncUser()─────────────────────►│               │
  │             │  (avec token)  │               │               │
  │             │                │               │─INSERT users──►│
  │             │◄──user data────────────────────│◄──success─────│
  │             │                │               │               │
  │◄─redirect───│                │               │               │
  │   home      │                │               │               │
```

---

**Conclusion** : Le flow est maintenant 100% conforme à ce que vous avez demandé. Firebase gère uniquement l'authentification, le token est automatiquement envoyé à Laravel, et Laravel gère toutes les données métier dans MySQL.
