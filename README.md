# Guide Michelin

Application de découverte de restaurants et hôtels étoilés avec système de réservations, programme de fidélité et chatbot IA.

## Stack technique

- **Framework** — Next.js 16 (App Router)
- **Base de données** — PostgreSQL + Prisma ORM
- **Authentification** — NextAuth.js v4
- **Styling** — Tailwind CSS v4
- **IA** — LangChain + Groq (Llama 3.3 70B)
- **Cartographie** — Leaflet + React Leaflet
- **Validation** — Zod

## Fonctionnalités

- Exploration des restaurants avec distinction Michelin (1 à 3 étoiles, Bib Gourmand, Étoile Verte)
- Liste et détail des hôtels (avec clés MICHELIN)
- Réservation de tables dans les restaurants (date, heure, nombre de couverts)
- Réservation de chambres d'hôtel (check-in, check-out, petit-déjeuner, late checkout)
- Programme de fidélité (BASIC → PREMIUM) avec promotions et codes promo
- Chatbot IA (Groq) pour recommandations personnalisées contextualisées
- Carte interactive des restaurants (filtres par distinction, cuisine, ambiance)
- Feed vertical (contenu social des établissements)
- Backoffice admin complet — dashboard, gestion restaurants, hôtels, utilisateurs, réservations

## Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Puis éditer .env avec vos valeurs

# Initialiser la base de données
npx prisma db push

# (Optionnel) Charger les données de démo (22 restaurants, 16 hôtels parisiens)
npx prisma db push && npx prisma db seed

# Lancer le serveur de développement
npm run dev
```

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Connexion PostgreSQL (`postgresql://user:password@host:5432/db`) |
| `NEXTAUTH_URL` | URL publique du site (`http://localhost:3000` en dev) |
| `NEXTAUTH_SECRET` | Secret long et aléatoire pour signer les sessions |
| `GROQ_API_KEY` | Clé API Groq (obligatoire pour le chatbot IA) |
| `GROQ_MODEL` | Modèle Groq (optionnel, défaut : `llama-3.3-70b-versatile`) |

## Comptes de test

Créez un compte via le formulaire d'inscription sur `/`. Pour accéder au backoffice admin, inscrivez-vous puis modifiez manuellement le `roleId` de votre utilisateur en base (1 = admin).

## Production

Déployez sur [https://votre-domaine.com](https://votre-domaine.com).

Un fichier deploy.yml est présent dans le .github afin de déployer automatiquement les changements commit sur la branch develop sur la prod
## API routes principales

| Route | Description |
|-------|-------------|
| `GET /api/restaurants` | Liste des restaurants |
| `GET /api/restaurants/[id]` | Détail d'un restaurant |
| `POST /api/restaurants/[id]/reservations` | Créer une réservation restaurant |
| `GET /api/hotel` | Liste des hôtels |
| `GET /api/hotel/[id]` | Détail d'un hôtel |
| `POST /api/hotel/booking` | Créer une réservation hôtel |
| `POST /api/chat` | Chatbot IA (Groq) |
| `GET /api/user/fidelite` | Programme de fidélité |
| `GET /api/admin/stats` | Dashboard admin |
| `GET /api/admin/users` | Gestion utilisateurs |
| `GET /api/admin/reservations` | Gestion réservations |

