# 🐓 AviAssist — Guide de déploiement (Windows)

## Ce que tu vas obtenir
Une application installable sur Android, accessible via un lien web, qui fonctionne hors-ligne.

---

## ÉTAPE 1 — Installer Node.js (5 minutes)

1. Va sur **https://nodejs.org**
2. Clique sur le bouton vert **"LTS"** (version recommandée)
3. Télécharge et installe le fichier `.msi`
4. Laisse toutes les options par défaut, clique "Next" jusqu'à la fin
5. **Redémarre ton ordinateur**

**Vérification :** Ouvre le menu Démarrer, tape `cmd`, appuie sur Entrée.  
Dans la fenêtre noire qui s'ouvre, tape :
```
node --version
```
Tu dois voir quelque chose comme `v20.x.x`. Si oui, Node.js est installé ✅

---

## ÉTAPE 2 — Préparer le projet (2 minutes)

1. Copie le dossier **`aviassist`** n'importe où sur ton ordinateur  
   (exemple : `C:\Users\TonNom\aviassist`)

2. Ouvre le menu Démarrer, tape `cmd`, appuie sur Entrée

3. Dans la fenêtre noire, tape les commandes suivantes **une par une** :

```
cd C:\Users\TonNom\aviassist
```
*(remplace `TonNom` par ton vrai nom d'utilisateur Windows)*

```
npm install
```
*(attends 1-2 minutes, des lignes vont défiler — c'est normal)*

**Vérification :** À la fin tu dois voir quelque chose comme `added 150 packages`. ✅

---

## ÉTAPE 3 — Tester en local (optionnel mais recommandé)

Dans la même fenêtre cmd, tape :
```
npm run dev
```

Ouvre ton navigateur et va sur **http://localhost:5173**  
Tu dois voir AviAssist fonctionner. ✅

Pour arrêter : appuie sur `Ctrl + C` dans la fenêtre cmd.

---

## ÉTAPE 4 — Créer un compte GitHub (3 minutes)

1. Va sur **https://github.com**
2. Clique **"Sign up"**
3. Entre ton email, crée un mot de passe, choisis un nom d'utilisateur
4. Vérifie ton email pour confirmer le compte

---

## ÉTAPE 5 — Mettre le projet sur GitHub (5 minutes)

### Installer Git

1. Va sur **https://git-scm.com/download/win**
2. Télécharge et installe (options par défaut)
3. Ferme et rouvre ta fenêtre cmd

### Créer le dépôt

1. Sur GitHub.com, clique sur le **"+"** en haut à droite → **"New repository"**
2. Nom du dépôt : `aviassist`
3. Laisse **Public** coché
4. **Ne coche rien d'autre**, clique **"Create repository"**

### Envoyer les fichiers

Dans ta fenêtre cmd (dans le dossier aviassist), tape ces commandes **une par une** :

```
git init
```
```
git add .
```
```
git commit -m "AviAssist v1"
```
```
git branch -M main
```
```
git remote add origin https://github.com/TON_NOM/aviassist.git
```
*(remplace `TON_NOM` par ton nom d'utilisateur GitHub)*

```
git push -u origin main
```

GitHub va te demander de te connecter → entre ton email et mot de passe GitHub. ✅

---

## ÉTAPE 6 — Déployer sur Vercel (3 minutes)

1. Va sur **https://vercel.com**
2. Clique **"Sign Up"** → choisis **"Continue with GitHub"**
3. Autorise Vercel à accéder à ton GitHub
4. Clique **"Add New Project"**
5. Tu vois ton dépôt `aviassist` → clique **"Import"**
6. Laisse tous les paramètres par défaut
7. Clique **"Deploy"**

Vercel va construire l'application en 1-2 minutes.  
À la fin tu obtiens un lien du type :  
**`https://aviassist-ton-nom.vercel.app`** ✅

---

## ÉTAPE 7 — Installer sur Android (1 minute)

1. Envoie le lien Vercel sur ton téléphone (WhatsApp, email, etc.)
2. Ouvre le lien dans **Chrome** sur Android
3. Chrome affiche une bannière **"Ajouter à l'écran d'accueil"** → appuie dessus
4. Ou : appuie sur les **3 points** en haut à droite → **"Ajouter à l'écran d'accueil"**
5. Confirme → l'icône AviAssist apparaît sur ton écran d'accueil 🎉

L'application s'ouvre en plein écran, sans barre de navigateur, comme une vraie app.  
Elle fonctionne **hors-ligne** une fois chargée.

---

## ÉTAPE 8 — Mettre à jour l'application (pour les prochaines fois)

Quand tu veux modifier l'appli (nouvelles fonctionnalités, corrections) :

1. Modifie les fichiers
2. Dans cmd, tape :
```
git add .
git commit -m "description de la modification"
git push
```
Vercel met à jour automatiquement en 1-2 minutes. ✅

---

## En cas de problème

| Problème | Solution |
|---|---|
| `node` non reconnu | Redémarre l'ordinateur après installation |
| `npm install` échoue | Vérifie ta connexion internet |
| `git push` demande un mot de passe | Entre ton email et ton **token GitHub** (pas mot de passe) |
| Page blanche sur Vercel | Vérifie que `vite.config.js` est bien présent |

---

## Structure des fichiers

```
aviassist/
├── public/
│   ├── manifest.json     ← Configuration PWA
│   ├── sw.js             ← Service worker (offline)
│   ├── icon-192.png      ← Icône Android
│   └── icon-512.png      ← Icône Android HD
├── src/
│   ├── main.jsx          ← Point d'entrée React
│   └── App.jsx           ← Application complète
├── index.html            ← Page principale
├── package.json          ← Dépendances
└── vite.config.js        ← Configuration du build
```

---

**Temps total estimé : 20–30 minutes la première fois.**  
Les mises à jour suivantes prennent moins de 2 minutes.
