# 🔐 Guide d'Activation des Connexions Sociales

## 📱 Boutons Disponibles

Votre application dispose maintenant de boutons cliquables pour :
- ✅ **Google Sign-In** - Connexion avec un compte Google
- ✅ **Facebook Login** - Connexion avec un compte Facebook

Les boutons sont déjà intégrés et fonctionnels, mais nécessitent une configuration dans Firebase !

---

## 🎯 Activation Rapide

### 1️⃣ Connexion Google (Recommandé - Le plus simple)

**Avantages :**
- ✅ Activation en 1 clic
- ✅ Pas besoin de configuration externe
- ✅ Fonctionne immédiatement
- ✅ Le plus utilisé par les utilisateurs

**Étapes :**

1. Allez sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionnez votre projet
3. Allez dans **Authentication** → **Sign-in method**
4. Cliquez sur **Google**
5. **Activez** le fournisseur (bouton toggle)
6. Sélectionnez un **email d'assistance** (votre email)
7. Cliquez sur **Enregistrer**

**C'est tout ! 🎉**

Testez :
- Allez sur `/login` ou `/signup`
- Cliquez sur le bouton "Google"
- Choisissez votre compte Google
- Vous êtes connecté !

---

### 2️⃣ Connexion Facebook (Plus complexe)

**Avantages :**
- ✅ Alternative populaire
- ✅ Permet de cibler les utilisateurs Facebook

**Prérequis :**
- Un compte Facebook développeur
- 15 minutes de configuration

**Étapes :**

#### A. Créer une application Facebook

1. Allez sur [Facebook Developers](https://developers.facebook.com)
2. Cliquez sur **"Mes applications"** → **"Créer une application"**
3. Choisissez **"Consommateur"** comme type d'application
4. Entrez un nom (ex: "LuxeStay Hotel App")
5. Entrez votre email
6. Cliquez sur **"Créer l'application"**

#### B. Configurer Facebook Login

1. Dans le tableau de bord de votre app Facebook
2. Cliquez sur **"Ajouter un produit"**
3. Cherchez **"Facebook Login"** et cliquez sur **"Configurer"**
4. Choisissez **"Web"**
5. Entrez votre URL de site :
   - Développement : `http://localhost:5173`
   - Production : `https://votredomaine.com`
6. Cliquez sur **"Enregistrer"**

#### C. Obtenir les clés

1. Dans le menu gauche, allez dans **Paramètres** → **Général**
2. Copiez :
   - **ID de l'application** (App ID)
   - **Clé secrète** (App Secret) - cliquez sur "Afficher"

#### D. Configurer Firebase

1. Retournez sur [Firebase Console](https://console.firebase.google.com)
2. Allez dans **Authentication** → **Sign-in method**
3. Cliquez sur **Facebook**
4. **Activez** le fournisseur
5. Collez :
   - **ID de l'application** → App ID copié
   - **Secret de l'application** → App Secret copié
6. **Copiez l'URL de redirection OAuth** fournie par Firebase
7. Cliquez sur **Enregistrer**

#### E. Configurer les redirections dans Facebook

1. Retournez sur Facebook Developers
2. Allez dans **Facebook Login** → **Paramètres**
3. Dans **"URI de redirection OAuth valides"**, collez l'URL copiée de Firebase
4. Cliquez sur **"Enregistrer les modifications"**

#### F. Mettre l'application en mode public (Important!)

1. Dans Facebook Developers, en haut de la page
2. Basculez le mode de **"Développement"** à **"Production"**
3. Acceptez les conditions

**Testez :**
- Allez sur `/login` ou `/signup`
- Cliquez sur le bouton "Facebook"
- Autorisez l'application
- Vous êtes connecté !

---

## 🔍 Comment ça fonctionne ?

### Lors de la première connexion (Inscription)

1. L'utilisateur clique sur "Google" ou "Facebook"
2. Une popup s'ouvre pour l'authentification
3. L'utilisateur se connecte avec son compte
4. Firebase récupère les informations de base (nom, email)
5. Un document est créé dans Firestore avec ces infos
6. L'utilisateur est redirigé vers la page d'accueil
7. Message de succès affiché

### Lors des connexions suivantes

1. L'utilisateur clique sur "Google" ou "Facebook"
2. Il est directement reconnu (pas besoin de mot de passe)
3. Ses informations sont récupérées de Firestore
4. Il est connecté et redirigé

---

## 📊 Données Stockées

Lorsqu'un utilisateur s'inscrit via Google/Facebook :

```javascript
{
  firstName: "Jean",        // Du compte Google/Facebook
  lastName: "Dupont",       // Du compte Google/Facebook
  email: "jean@gmail.com",  // Du compte Google/Facebook
  phone: "",                // Vide par défaut
  createdAt: "2024-..."     // Date de création
}
```

L'utilisateur peut ensuite mettre à jour son profil pour ajouter son numéro de téléphone.

---

## ⚠️ Erreurs Courantes

### "auth/popup-closed-by-user"
**Cause :** L'utilisateur a fermé la popup avant de se connecter.
**Solution :** Message affiché : "La fenêtre de connexion a été fermée"

### "auth/account-exists-with-different-credential"
**Cause :** L'email est déjà utilisé avec un autre fournisseur.
**Exemple :** Email inscrit avec Google, tentative de connexion avec Facebook.
**Solution :** Demandez à l'utilisateur d'utiliser le même fournisseur.

### "auth/operation-not-allowed"
**Cause :** Le fournisseur n'est pas activé dans Firebase.
**Solution :** Activez le fournisseur dans Firebase Console.

### Facebook : "Invalid OAuth Redirect URI"
**Cause :** L'URL de redirection n'est pas configurée dans Facebook.
**Solution :** Ajoutez l'URL Firebase dans les paramètres Facebook Login.

---

## 🎨 Interface Utilisateur

### Page de Connexion (`/login`)
- Bouton "Google" avec logo
- Bouton "Facebook" avec logo
- Diviseur "Ou continuer avec"

### Page d'Inscription (`/signup`)
- Bouton "Google" avec logo
- Bouton "Facebook" avec logo
- Diviseur "Ou s'inscrire avec"

### États des boutons
- ✅ Normal : Cliquable avec hover
- ⏳ Chargement : Désactivé pendant la requête
- ❌ Erreur : Message d'erreur affiché au-dessus

---

## 🔐 Sécurité

### Avantages
- ✅ Pas de mot de passe à gérer
- ✅ Authentification gérée par Google/Facebook
- ✅ Plus sécurisé (OAuth 2.0)
- ✅ Moins de friction pour l'utilisateur

### Firebase Auth s'occupe de :
- Vérification de l'identité
- Gestion des tokens
- Sécurité des sessions
- Protection contre les attaques

---

## 📈 Statistiques

Vous pouvez voir dans Firebase Console :
- **Authentication** → **Users**
  - Nombre d'utilisateurs par fournisseur
  - Email/Password vs Google vs Facebook
  - Date d'inscription
  - Dernière connexion

---

## ✅ Checklist

### Google Sign-In
- [ ] Fournisseur Google activé dans Firebase
- [ ] Email d'assistance configuré
- [ ] Test de connexion réussi
- [ ] Utilisateur créé dans Firestore

### Facebook Login
- [ ] Application Facebook créée
- [ ] Facebook Login configuré
- [ ] ID et Secret copiés dans Firebase
- [ ] URL de redirection configurée
- [ ] Application en mode Production
- [ ] Test de connexion réussi
- [ ] Utilisateur créé dans Firestore

---

## 💡 Recommandations

### Développement
1. **Commencez par Google** - C'est le plus simple
2. **Testez avec plusieurs comptes** - Vérifiez que tout fonctionne
3. **Vérifiez Firestore** - Assurez-vous que les données sont bien enregistrées

### Production
1. **Activez Google ET Facebook** - Donnez le choix aux utilisateurs
2. **Configurez les domaines autorisés** dans Firebase
3. **Ajoutez votre domaine** dans Facebook
4. **Mettez en place la politique de confidentialité** (requis par Facebook)

---

## 🎯 Résumé

**Avec Email/Password :**
- ✅ Inscription manuelle
- ✅ Choix du mot de passe
- ✅ Vérification d'email possible

**Avec Google/Facebook :**
- ✅ Inscription en 1 clic
- ✅ Pas de mot de passe à retenir
- ✅ Plus rapide pour l'utilisateur
- ✅ Plus sécurisé

**Votre application supporte les 3 méthodes ! 🎉**

Les utilisateurs peuvent choisir celle qui leur convient le mieux.

---

## 🚀 Prêt !

Activez au minimum **Google Sign-In** pour offrir une expérience utilisateur optimale !

Pour toute question, consultez la [documentation Firebase Auth](https://firebase.google.com/docs/auth).
