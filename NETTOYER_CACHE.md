# 🧹 Nettoyage du Cache - IMPORTANT

## Le Problème

Vous voyez encore l'erreur `/api/auth/sync` car le **navigateur et Vite ont mis en cache les anciens fichiers**.

## Solution : Nettoyer Complètement

### Étape 1 : Arrêter le serveur de développement

```bash
# Appuyer sur Ctrl+C dans le terminal où tourne le serveur
```

### Étape 2 : Nettoyer le cache Vite

```bash
# Supprimer les dossiers de cache
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Nettoyer le cache npm/pnpm
pnpm store prune
```

### Étape 3 : Redémarrer le serveur

```bash
pnpm dev
```

### Étape 4 : Nettoyer le cache du navigateur

#### Option 1 : Vider le cache (Recommandé)
1. Ouvrir les DevTools (F12)
2. Clic droit sur le bouton de rafraîchissement
3. Sélectionner **"Vider le cache et actualiser de force"** (Empty Cache and Hard Reload)

#### Option 2 : Mode Incognito
1. Ouvrir une fenêtre de navigation privée (Ctrl+Shift+N)
2. Aller sur `http://localhost:5173`
3. Tester l'inscription propriétaire

#### Option 3 : Nettoyer le localStorage
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet **Application** (ou **Storage**)
3. Cliquer sur **Local Storage** → `http://localhost:5173`
4. **Supprimer** la clé `auth_token` (ou tout supprimer)
5. Rafraîchir la page (F5)

### Étape 5 : Vérifier que les anciens fichiers n'existent plus

```bash
# Ces commandes ne doivent RIEN retourner
ls src/app/context/UserContext.tsx.old 2>/dev/null
ls src/app/services/api.ts.old 2>/dev/null
```

Si ces fichiers existent encore :
```bash
rm -f src/app/context/UserContext.tsx.old
rm -f src/app/services/api.ts.old
```

## Vérification

### Fichiers qui DOIVENT exister :
- ✅ `src/app/context/AuthContext.tsx`
- ✅ `src/app/services/sanctumApi.ts`
- ✅ `src/app/services/api.ts` (nouveau, sans Firebase)

### Fichiers qui NE DOIVENT PLUS exister :
- ❌ `src/app/context/UserContext.tsx` ou `UserContext.tsx.old`
- ❌ `src/app/services/api.ts.old`

## Test Rapide

Après le nettoyage :

1. Se connecter (ou s'inscrire)
2. Aller sur `/owner/register`
3. Remplir le formulaire
4. Soumettre

**Vous NE DEVEZ PLUS voir** :
- ❌ `POST http://localhost:8000/api/auth/sync 401`
- ❌ Erreur "Token invalide ou expiré"

**Vous DEVEZ voir** :
- ✅ `POST http://localhost:8000/api/owner/register`
- ✅ Redirection vers le dashboard
- ✅ Rôle changé en "Propriétaire"

## Si l'erreur persiste

### Vérifier le token
```bash
# Dans la console du navigateur (F12)
console.log(localStorage.getItem('auth_token'));
```

Si le token est `null`, vous devez vous reconnecter.

### Vérifier la structure de l'import
```bash
# Chercher les imports de UserContext qui ne devraient plus exister
grep -r "UserContext" src/app/ --include="*.tsx" --include="*.ts"
```

Si vous voyez des imports de `UserContext`, supprimez-les ou remplacez-les par `AuthContext`.

## En Résumé

```bash
# Script complet de nettoyage
rm -rf node_modules/.vite dist .vite
rm -f src/app/context/UserContext.tsx.old
rm -f src/app/services/api.ts.old
pnpm dev
```

Puis dans le navigateur :
1. Vider le cache et actualiser (Ctrl+Shift+R ou Cmd+Shift+R)
2. Ou ouvrir en mode Incognito

---

**Une fois le cache nettoyé, tout devrait fonctionner parfaitement !** 🎉
