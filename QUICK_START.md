# 🚀 Quick Start - Authentification et Profil Utilisateur

## ✅ Ce qui est déjà fait

### 1. **Menu Profil dans la Navbar** ✨

Quand un utilisateur s'inscrit/se connecte, il voit automatiquement :
- Sa photo de profil (ou icône par défaut)
- Son prénom
- Menu dropdown avec :
  - **Mon Profil** → Page `/profile`
  - **Déconnexion**

### 2. **Page Profil Complète** ✨

URL : `/profile`

L'utilisateur peut modifier :
- ✅ Nom complet
- ✅ Email
- ✅ Téléphone
- ✅ Photo de profil (URL)

### 3. **Deux systèmes d'authentification disponibles**

#### Option A : Firebase Authentication (déjà configuré)
- ✅ Signup/Login email/password
- ✅ Social login Google/Facebook
- ✅ Token Firebase envoyé automatiquement à Laravel

#### Option B : Laravel Sanctum (nouveau) ✨
- ✅ Setup complet dans `LARAVEL_SANCTUM_GUIDE.md`
- ✅ API tokens simples
- ✅ Social login avec Socialite
- ✅ Service React prêt (`src/app/services/sanctumApi.ts`)

## 🎯 Comment utiliser ?

### Scénario 1 : Garder Firebase (actuel)

**Rien à faire !** Tout est déjà configuré.

1. L'utilisateur s'inscrit via Firebase
2. Le menu profil apparaît automatiquement
3. Il peut cliquer sur "Mon Profil" pour modifier ses infos
4. Les données sont synchronisées avec Laravel

### Scénario 2 : Migrer vers Sanctum

Suivre le guide `MIGRATION_FIREBASE_TO_SANCTUM.md`

1. Installer Laravel Sanctum (backend)
2. Créer AuthController
3. Adapter les pages Login/Signup pour utiliser `sanctumApi`
4. Tester

### Scénario 3 : Les deux en parallèle

Possibilité de garder Firebase ET ajouter Sanctum :

```typescript
// Dans UserContext
const authMethod = localStorage.getItem('auth_method');

if (authMethod === 'sanctum') {
  // Utiliser sanctumApi
} else {
  // Utiliser Firebase (défaut)
}
```

## 📁 Fichiers créés

### Frontend

```
src/app/
├── services/
│   ├── api.ts              # Service Firebase → Laravel
│   └── sanctumApi.ts       # Service Sanctum (nouveau)
├── pages/
│   ├── Profile.tsx         # Page profil (nouveau)
│   └── AuthCallback.tsx    # Callback social login (nouveau)
└── components/
    └── Navbar.tsx          # Menu profil amélioré
```

### Documentation

```
docs/
├── LARAVEL_SANCTUM_GUIDE.md           # Setup Sanctum complet
├── MIGRATION_FIREBASE_TO_SANCTUM.md   # Guide migration
└── IMPLEMENTATION_STATUS.md           # État de l'implémentation
```

## 🧪 Tester le menu profil

### 1. Se connecter

```typescript
// Soit via Firebase (déjà configuré)
// Soit via Sanctum :
const { token, user } = await sanctumApi.login({
  email: 'test@example.com',
  password: 'password123'
});
localStorage.setItem('auth_token', token);
```

### 2. Vérifier le menu

- En haut à droite : photo + prénom
- Click → dropdown avec "Mon Profil" et "Déconnexion"

### 3. Tester la page profil

- Click "Mon Profil"
- Modifier nom/email/téléphone
- Click "Enregistrer"
- ✅ Données mises à jour

## 🔧 Backend Laravel requis

Pour que tout fonctionne, vous devez :

### Option A : Firebase Auth + Laravel (actuel)

Suivre `LARAVEL_BACKEND_GUIDE.md` :
1. Installer Firebase Admin SDK
2. Créer les endpoints API
3. Vérifier les tokens Firebase

### Option B : Laravel Sanctum (nouveau)

Suivre `LARAVEL_SANCTUM_GUIDE.md` :
1. Installer Sanctum
2. Créer AuthController
3. Configurer social login

## 📊 Comparaison

| Fonctionnalité | Firebase | Sanctum |
|----------------|----------|---------|
| **Setup frontend** | ✅ Fait | ✅ Fait |
| **Setup backend** | 🔄 À faire | 🔄 À faire |
| **Social login** | ✅ Intégré | ⚙️ Via Socialite |
| **Tokens** | JWT (Firebase) | API tokens |
| **Complexité** | Moyenne | Faible |
| **Coût** | Gratuit (limits) | Serveur requis |

## 🎨 Interface utilisateur

### Menu Profil (déjà fait)

```
┌──────────────────────────────┐
│  [Photo] Jean Dupont    ▼    │
└──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│                              │
│  [Photo]  Jean Dupont        │
│           Membre             │
│                              │
│  ✉️  jean@example.com        │
│  📞  +33 6 12 34 56 78       │
│                              │
│  ──────────────────────      │
│                              │
│  ⚙️  Mon Profil              │
│  🚪  Déconnexion             │
│                              │
└──────────────────────────────┘
```

### Page Profil (déjà fait)

```
┌────────────────────────────────────┐
│                                    │
│        [Photo de profil]           │
│          Jean Dupont               │
│                                    │
│  ┌─ Informations personnelles ─┐  │
│  │                              │  │
│  │  Nom complet: [Jean Dupont]  │  │
│  │  Email: [jean@example.com]   │  │
│  │  Téléphone: [+33 6...]       │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌─ Photo de profil ──────────┐   │
│  │  URL: [https://...]         │   │
│  └──────────────────────────────┘  │
│                                    │
│     [💾 Enregistrer]               │
│                                    │
└────────────────────────────────────┘
```

## 🚨 Important

### Pour Firebase (actuel)
- ✅ Frontend configuré
- ⚠️ Backend Laravel à créer (voir `LARAVEL_BACKEND_GUIDE.md`)
- ⚠️ Firebase Console à configurer (Google/Facebook OAuth)

### Pour Sanctum (nouveau)
- ✅ Frontend prêt (`sanctumApi.ts`)
- ⚠️ Backend Laravel à créer (voir `LARAVEL_SANCTUM_GUIDE.md`)
- ⚠️ Google Cloud Console + Facebook App à configurer

## ✨ Prochaines étapes

1. **Choisir** : Firebase ou Sanctum ?
2. **Configurer** : Suivre le guide correspondant
3. **Tester** : Login → Menu profil → Page profil
4. **Déployer** : Mettre en production

---

**Temps estimé de setup backend** : 2-3 heures (Firebase ou Sanctum)
