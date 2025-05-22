# 📝 TaskFlow

TaskFlow est une application fullstack de gestion de tâches personnelles, pensée pour les développeurs souhaitant s'exercer sur un projet concret, complet, et structuré.

---

## 🚀 Objectif

Créer une application web simple permettant à un utilisateur de :

- Créer un compte et se connecter
- Ajouter, modifier, supprimer ses tâches
- Filtrer ses tâches par statut (à faire, en cours, terminé)

---

## 🧱 Stack technique

### Backend :

- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT pour l’authentification
- Bcrypt pour le hash des mots de passe

### Frontend (à venir) :

- React
- Tailwind CSS
- Axios

---

## 📦 Fonctionnalités prévues (MVP)

- [x] Création d’un compte utilisateur (`/register`)
- [x] Connexion (`/login`)
- [ ] Authentification via JWT
- [ ] CRUD des tâches :
  - [ ] Création
  - [ ] Lecture
  - [ ] Modification
  - [ ] Suppression
- [ ] Filtrage des tâches par statut

---

## 🔐 Authentification

L'authentification est basée sur JWT :

- À l'inscription ou la connexion, un token est généré
- Ce token est ensuite utilisé pour accéder aux routes protégées (ex : `/tasks`)

---

## 🗂 Structure du projet (backend)

taskflow-backend/
├── models/
│ ├── User.js
│ └── Task.js
├── routes/
│ ├── auth.js
│ └── tasks.js
├── controllers/
│ ├── authController.js
│ └── taskController.js
├── middleware/
│ └── authMiddleware.js
├── config/
│ └── db.js
├── server.js
├── .env
└── README.md

---

## 🛠️ Lancer le projet

### Pré-requis :

- Node.js v18+
- Yarn
- Un compte MongoDB Atlas

### Étapes :

1. Cloner le repo
2. Installer les dépendances :  
   `yarn install`
3. Créer un fichier `.env` :

```env
PORT=5000
MONGO_URI=<votre URI MongoDB Atlas>
JWT_SECRET=<votre clé secrète>
```

4. Lancer le serveur :
   `yarn dev (ou node server.js)`
