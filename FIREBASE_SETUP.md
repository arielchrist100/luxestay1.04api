# 🔥 Configuration Firebase - Guide Complet

## 📋 Table des Matières
1. [Créer un projet Firebase](#1-créer-un-projet-firebase)
2. [Activer l'authentification](#2-activer-lauthentification)
3. [Configurer Firestore](#3-configurer-firestore)
4. [Obtenir les clés de configuration](#4-obtenir-les-clés-de-configuration)
5. [Configurer l'application](#5-configurer-lapplication)
6. [Tester l'application](#6-tester-lapplication)

---

## 1. Créer un projet Firebase

### Étape 1.1 : Accéder à la Console Firebase
1. Allez sur [console.firebase.google.com](https://console.firebase.google.com)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Ajouter un projet"**

### Étape 1.2 : Configurer le projet
1. **Nom du projet** : Entrez un nom (ex: `luxestay-hotel-app`)
2. **Google Analytics** : Activez ou désactivez selon vos besoins
3. Cliquez sur **"Créer un projet"**
4. Attendez la création (environ 30 secondes)
5. Cliquez sur **"Continuer"**

---

## 2. Activer l'Authentification

### Étape 2.1 : Accéder à Authentication
1. Dans le menu de gauche, cliquez sur **"Authentication"**
2. Cliquez sur **"Commencer"** (Get Started)

### Étape 2.2 : Activer Email/Mot de passe
1. Allez dans l'onglet **"Sign-in method"**
2. Cliquez sur **"Email/Password"**
3. **Activez** la première option (Email/Password)
4. Cliquez sur **"Enregistrer"**

### Étape 2.3 : (Optionnel) Activer Google Sign-In
1. Cliquez sur **"Google"**
2. **Activez** le fournisseur
3. Sélectionnez un email d'assistance
4. Cliquez sur **"Enregistrer"**

### Étape 2.4 : (Optionnel) Activer Facebook Sign-In
1. Cliquez sur **"Facebook"**
2. **Activez** le fournisseur
3. Entrez l'ID de l'application et le secret (obtenez-les sur [developers.facebook.com](https://developers.facebook.com))
4. Cliquez sur **"Enregistrer"**

---

## 3. Configurer Firestore

### Étape 3.1 : Créer la base de données
1. Dans le menu de gauche, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**
3. **Mode de sécurité** : Choisissez **"Commencer en mode test"** (pour le développement)
   - ⚠️ **Important** : En production, configurez des règles de sécurité appropriées !
4. **Emplacement** : Choisissez la région la plus proche (ex: `europe-west1`)
5. Cliquez sur **"Activer"**

### Étape 3.2 : Structure de données
La collection `users` sera automatiquement créée lors de la première inscription.

Structure d'un document utilisateur :
```
users (collection)
└── {userId} (document)
    ├── firstName: string
    ├── lastName: string
    ├── email: string
    ├── phone: string
    └── createdAt: string
```

### Étape 3.3 : (Optionnel) Règles de sécurité
Pour l'instant, les règles de test sont suffisantes. En production, utilisez :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs peuvent lire et écrire uniquement leurs propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Les réservations peuvent être lues et écrites par l'utilisateur propriétaire
    match /reservations/{reservationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 4. Obtenir les Clés de Configuration

### Étape 4.1 : Ajouter une application Web
1. Dans la page d'accueil du projet, cliquez sur l'icône **Web** `</>`
2. **Nom de l'application** : Entrez un nom (ex: `LuxeStay Web App`)
3. **Firebase Hosting** : Cochez si vous voulez héberger sur Firebase (optionnel)
4. Cliquez sur **"Enregistrer l'application"**

### Étape 4.2 : Copier la configuration
Vous verrez un code JavaScript comme ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

**📋 Copiez ces valeurs !**

---

## 5. Configurer l'Application

### Étape 5.1 : Ouvrir le fichier de configuration
Ouvrez le fichier `/src/app/config/firebase.ts`

### Étape 5.2 : Remplacer les valeurs
Remplacez les valeurs de `firebaseConfig` par celles que vous avez copiées :

```typescript
const firebaseConfig = {
  apiKey: "VOTRE_VRAIE_API_KEY",                    // ← Remplacez ici
  authDomain: "votre-projet.firebaseapp.com",       // ← Remplacez ici
  projectId: "votre-projet",                        // ← Remplacez ici
  storageBucket: "votre-projet.appspot.com",        // ← Remplacez ici
  messagingSenderId: "VOTRE_SENDER_ID",             // ← Remplacez ici
  appId: "VOTRE_APP_ID"                             // ← Remplacez ici
};
```

### Étape 5.3 : Sauvegarder
Sauvegardez le fichier. C'est tout ! 🎉

---

## 6. Tester l'Application

### Test 1 : Inscription
1. Lancez votre application : `npm run dev`
2. Allez sur la page d'inscription : `/signup`
3. Remplissez le formulaire :
   - Prénom : Jean
   - Nom : Dupont
   - Email : jean@test.com
   - Téléphone : 0612345678
   - Mot de passe : password123
   - Confirmer : password123
4. Cliquez sur **"Créer mon compte"**

**✅ Résultat attendu :**
- Message "Inscription Réussie !"
- Redirection vers la page d'accueil
- Nom affiché dans la navbar : "Jean Dupont"

**🔍 Vérification dans Firebase :**
1. Allez dans **Authentication** > **Users**
2. Vous devriez voir l'utilisateur créé
3. Allez dans **Firestore Database**
4. Collection `users` > Document avec l'UID de l'utilisateur
5. Vérifiez que toutes les données sont présentes

### Test 2 : Connexion
1. Déconnectez-vous (cliquez sur votre nom dans la navbar)
2. Allez sur `/login`
3. Entrez :
   - Email : jean@test.com
   - Mot de passe : password123
4. Cliquez sur **"Se connecter"**

**✅ Résultat attendu :**
- Connexion réussie
- Redirection vers la page d'accueil
- Nom affiché dans la navbar

### Test 3 : Erreurs
Testez les cas d'erreur :

**Email déjà utilisé :**
- Essayez de créer un compte avec le même email
- Erreur : "Cet email est déjà utilisé"

**Mauvais mot de passe :**
- Essayez de vous connecter avec un mauvais mot de passe
- Erreur : "Email ou mot de passe incorrect"

**Email invalide :**
- Essayez de vous inscrire avec "test@test"
- Erreur : "Email invalide"

---

## 🔒 Sécurité

### Variables d'environnement (Recommandé pour la production)

**Étape 1 :** Créez un fichier `.env` à la racine du projet :

```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Étape 2 :** Modifiez `/src/app/config/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

**Étape 3 :** Ajoutez `.env` à `.gitignore` :

```
.env
.env.local
```

---

## 🆘 Dépannage

### Erreur : "Firebase: Error (auth/configuration-not-found)"
**Cause :** Les clés de configuration ne sont pas correctes.
**Solution :** Vérifiez que vous avez bien copié toutes les valeurs depuis la console Firebase.

### Erreur : "Firebase: Error (auth/operation-not-allowed)"
**Cause :** L'authentification Email/Password n'est pas activée.
**Solution :** Allez dans Authentication > Sign-in method et activez Email/Password.

### Erreur : "Firebase: Error (auth/network-request-failed)"
**Cause :** Problème de connexion Internet ou Firebase est bloqué.
**Solution :** Vérifiez votre connexion Internet et les paramètres du pare-feu.

### Les utilisateurs s'affichent dans Authentication mais pas dans Firestore
**Cause :** Erreur lors de l'écriture dans Firestore (règles de sécurité trop strictes).
**Solution :** Vérifiez que vous êtes en mode test ou que les règles permettent l'écriture.

### "Missing or insufficient permissions"
**Cause :** Les règles de sécurité Firestore bloquent l'accès.
**Solution :** En mode développement, utilisez les règles de test. En production, configurez les règles appropriées.

---

## 📊 Fonctionnalités Disponibles

✅ **Authentification Email/Mot de passe**
- Inscription avec email et mot de passe
- Connexion avec email et mot de passe
- Déconnexion
- Gestion des erreurs

✅ **Stockage des données utilisateur**
- Informations stockées dans Firestore
- Prénom, nom, email, téléphone
- Date de création

🔜 **Prochaines fonctionnalités (optionnelles)**
- Authentification Google
- Authentification Facebook
- Réinitialisation du mot de passe
- Vérification de l'email
- Mise à jour du profil
- Suppression du compte

---

## 🎯 Checklist Complète

Avant de tester :

- [ ] Projet Firebase créé
- [ ] Authentication activée (Email/Password)
- [ ] Firestore Database créée
- [ ] Application Web ajoutée
- [ ] Clés de configuration copiées
- [ ] Fichier `/src/app/config/firebase.ts` mis à jour
- [ ] Application lancée (`npm run dev`)
- [ ] Test d'inscription réussi ✅
- [ ] Test de connexion réussi ✅
- [ ] Utilisateur visible dans Firebase Console ✅

---

## 💡 Conseils

1. **Ne commitez jamais vos clés Firebase sur Git** (utilisez `.env`)
2. **En production, configurez les règles de sécurité Firestore**
3. **Activez la vérification d'email** pour plus de sécurité
4. **Limitez les domaines autorisés** dans les paramètres Firebase
5. **Surveillez l'utilisation** dans le tableau de bord Firebase

---

## 🚀 Prêt !

Votre application utilise maintenant Firebase pour l'authentification ! 🎉

Les utilisateurs peuvent :
- Créer un compte
- Se connecter
- Leurs données sont stockées en toute sécurité dans Firebase

**Prochaine étape :** Intégrez le système de réservations avec Firestore !