# Livreo (SENAME EDITION'S)

Plateforme Next.js de présentation et vente d'ouvrages avec espace client et back-office admin.

## Stack technique
- Next.js 15 (App Router)
- React 18
- Tailwind CSS
- MongoDB + Mongoose

## Fonctionnalités implémentées

### Catalogue et parcours client
- Catalogue d'ouvrages: achat direct, précommande, crowdfunding.
- Page détail ouvrage (`/ouvrages/[slug]`): infos livre, progression crowdfunding, actions d'achat/contribution.
- Panier (`/panier`): quantité, suppression, code promo, choix Stripe/PayPal.
- Espace client (`/mon-compte`): dashboard, commandes, transactions, contributions, wishlist, profil.
- Historique achats (`/mes-achats`) et contributions (`/mes-contributions`).
- Wishlist client:
  - ajout unitaire au panier
  - partage de la liste (copie lien)
  - ajout global `Tout ajouter au panier`

### Paiement et commandes
- Création commande en statut `pending` avant paiement.
- Stripe Embedded Checkout.
- PayPal Checkout (create order + capture).
- Workflow d'état des commandes:
  - création: `pending`
  - paiement validé: `paid`
  - annulation utilisateur avant paiement: `cancelled`
  - remboursement admin: `refunded`
- Retry paiement d'une commande `pending`:
  - page `/commande/reessayer?orderId=...`
  - endpoint `POST /api/orders/[id]/retry-payment`
- Annulation commande depuis retour d'annulation paiement:
  - page `/commande/annulee?orderId=...`
  - endpoint `POST /api/orders/cancel`

### Factures
- Génération facture PDF à la validation du paiement.
- Stockage base64 dans la commande (`invoicePdfBase64`).
- Consultation/téléchargement:
  - `GET /api/orders/[id]/invoice?disposition=inline`
  - `GET /api/orders/[id]/invoice?disposition=attachment`
- Règle d'accès:
  - facture disponible uniquement si commande `paid` ou `refunded`
  - si commande non payée (`pending`/`cancelled`), l'UI affiche une boîte de message:
    - `La facture est générée uniquement après un paiement effectué avec succès.`
    - bouton `OK`
- Vue facture (`/factures/[id]`) et téléchargement utilisent le même PDF.

### Sécurité et robustesse (paiement)
- Vérification serveur des paiements Stripe/PayPal (pas de validation côté client uniquement).
- Vérification signature webhooks Stripe et PayPal.
- Rate limiting en mémoire sur endpoints sensibles (paiements, commandes, commentaires, etc.).
- Validation stricte des payloads API.
- Journalisation des événements de paiement (`PaymentTransaction`).

### Back-office admin
- Sections: dashboard, ouvrages, utilisateurs, commandes, contributions, paiements, marketing.
- Gestion des statuts commande (incluant remboursement).
- Listing transactions paiement/remboursement (`/admin/payments`).

## Routes principales (pages)
- `/` accueil
- `/ouvrages/[slug]` détail ouvrage
- `/panier` panier
- `/commande/paiement/stripe` checkout Stripe embedded
- `/commande/succes`, `/commande/echec`, `/commande/annulee`, `/commande/reessayer`
- `/connexion`, `/inscription`
- `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`
- `/mon-compte`, `/mes-achats`, `/mes-contributions`, `/ma-wishlist`
- `/factures/[id]` aperçu facture (avec bouton téléchargement)
- `/admin`, `/admin/ouvrages`, `/admin/users`, `/admin/orders`, `/admin/contributions`, `/admin/comments`, `/admin/payments`, `/admin/marketing`

## API (aperçu)

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

### Client
- Panier: `GET/POST /api/me/cart`, `POST /api/me/cart/wishlist`
- Wishlist: `GET/POST /api/me/wishlist`, `POST /api/me/wishlist/share`, `GET /api/wishlist/share/[token]`
- Profil: `GET/PATCH /api/me/profile`, `PATCH /api/me/password`
- Commandes: `POST /api/orders`, `GET /api/me/orders`, `GET /api/me/orders/export`
- Facture: `GET /api/orders/[id]/invoice`
- Transactions: `GET /api/me/transactions`
- Contributions: `GET /api/me/contributions`, `GET/POST /api/contributions`, `GET /api/contributions/stream`
- Commentaires: `GET/POST /api/comments`, `PATCH /api/comments/[id]/reply`

### Paiements
- Stripe:
  - `POST /api/payments/stripe/embedded-session`
  - `POST /api/payments/stripe/complete`
  - `POST /api/payments/stripe/webhook`
- PayPal:
  - `POST /api/payments/paypal/create-order`
  - `POST /api/payments/paypal/complete`
  - `POST /api/payments/paypal/webhook`
- Commande et paiement:
  - `POST /api/orders/cancel`
  - `POST /api/orders/[id]/retry-payment`

### Admin
- `GET/PATCH /api/admin/users`
- `GET/PATCH /api/admin/orders`
- `GET/PATCH /api/admin/contributions`
- `GET/PATCH /api/admin/comments`
- `GET/PATCH /api/admin/books`
- `GET/POST/PATCH /api/admin/promos`
- `GET /api/admin/stats`
- `GET /api/admin/payments`
- `GET /api/admin/audit`
- `POST /api/admin/notifications/run`
- `POST /api/admin/bootstrap`

## Modèles principaux
- `Book`, `User`, `Order`, `Cart`, `Contribution`, `Comment`
- `PromoCode`, `NewsletterSubscription`, `WishlistShare`, `AbandonedCart`
- `EmailLog`, `AdminAuditLog`, `PasswordResetToken`, `PaymentTransaction`

## Prérequis
- Node.js 20+
- MongoDB

## Configuration locale
```bash
cp .env.example .env.local
```

Variables minimales:
```bash
MONGODB_URI=mongodb://localhost:27017/livreo
AUTH_SECRET=replace_with_a_long_random_secret
ADMIN_BOOTSTRAP_SECRET=replace_with_admin_bootstrap_secret
APP_BASE_URL=http://localhost:3000

STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

### Générer les secrets
Option `openssl` (recommandé):
```bash
openssl rand -base64 48
```
Exécuter 2 fois:
- résultat 1 -> `AUTH_SECRET`
- résultat 2 -> `ADMIN_BOOTSTRAP_SECRET`

Option Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

## Configuration production (pré-déploiement)

### Variables d'environnement
- `MONGODB_URI` (prod)
- `AUTH_SECRET`
- `ADMIN_BOOTSTRAP_SECRET`
- `APP_BASE_URL` (URL HTTPS publique)
- `STRIPE_SECRET_KEY` (`sk_live_...`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (`pk_live_...`)
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID` (live)
- `PAYPAL_CLIENT_SECRET` (live)
- `PAYPAL_API_BASE_URL=https://api-m.paypal.com`
- `PAYPAL_WEBHOOK_ID`

### Comment spécifier `MONGODB_URI` et `APP_BASE_URL`
- `MONGODB_URI` doit pointer vers la base de production (Atlas ou serveur Mongo dédié).
- `APP_BASE_URL` doit être l'URL publique HTTPS finale de l'application (sans slash final).

Exemple:
```bash
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/livreo?retryWrites=true&w=majority
APP_BASE_URL=https://livreo.tondomaine.com
```

Règles:
- Ne jamais utiliser `localhost` en production.
- Ne pas mettre de slash final dans `APP_BASE_URL` (`https://livreo.tondomaine.com`, pas `https://livreo.tondomaine.com/`).
- Encoder les caractères spéciaux du mot de passe MongoDB dans l'URI si nécessaire.
- Définir ces variables dans la plateforme de déploiement (Vercel/Render/Railway/Docker), pas dans le code.

### Stripe
- Webhook: `https://votredomaine.com/api/payments/stripe/webhook`
- Événements minimum:
  - `checkout.session.completed`
  - `charge.refunded`
- Vérifier que le compte Stripe est activé en live (KYC/Business details finalisés).

### PayPal
- Webhook: `https://votredomaine.com/api/payments/paypal/webhook`
- Événements minimum:
  - `PAYMENT.CAPTURE.COMPLETED`
  - `PAYMENT.CAPTURE.REFUNDED`
- Vérifier que l'application PayPal est en mode live et le compte validé.

### Infra et sécurité recommandées
- HTTPS obligatoire en production.
- Sauvegardes MongoDB + test de restauration.
- Logs centralisés (API + webhooks).
- Remplacer le rate limit mémoire par Redis en multi-instance.

## Démarrage
```bash
npm install
npm run dev
```
App: `http://localhost:3000`

## Build/Run production
```bash
npm run build
npm run start
```

## Bootstrap admin
Après inscription d'un utilisateur:
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemple.com","secret":"VOTRE_ADMIN_BOOTSTRAP_SECRET"}'
```

Version avec variables d'environnement:
```bash
curl -X POST "${APP_BASE_URL}/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@exemple.com\",\"secret\":\"${ADMIN_BOOTSTRAP_SECRET}\"}"
```

Exemple production:
```bash
curl -X POST "https://votredomaine.com/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@exemple.com","secret":"VOTRE_ADMIN_BOOTSTRAP_SECRET"}'
```

## Collections et migrations
- Les collections MongoDB sont créées automatiquement par Mongoose au premier usage (création/écriture de documents).
- Le projet n'utilise pas de système de migrations versionnées (pas de dossier/type `migrations`).
- Les index déclarés dans les schémas Mongoose sont appliqués par Mongoose au démarrage/usage des modèles.

## Docker
```bash
docker compose up --build
```
- App via Traefik: `http://localhost`
- Dashboard Traefik: `http://localhost:8080`

## Checklist avant passage en live
- `npm run lint`
- `npm run build`
- Test Stripe: succès, annulation, remboursement, webhook.
- Test PayPal: succès, annulation, remboursement, webhook.
- Vérifier génération/visualisation/téléchargement facture.
- Vérifier redirection post-paiement vers `/mon-compte?section=orders`.
- Vérifier UX factures:
  - colonne `Factures` dans le tableau commandes
  - popup informative affichée si tentative d'ouverture/téléchargement avant paiement réussi
- En live, un paiement réel client peut passer sans utiliser tes cartes de test, mais il est recommandé de faire au moins un petit paiement réel de validation bout-en-bout.

## Dépannage (dev cache Next.js)
Si erreurs du type `Cannot find module './1331.js'`, `vendor-chunks/@swc.js`, `routes-manifest.json` manquant:
1. Arrêter `next dev`.
2. Supprimer le build cache:
```bash
rm -rf .next
```
3. Relancer:
```bash
npm run dev
```

Le projet désactive aussi le cache webpack en dev (`next.config.mjs`) pour limiter ces corruptions de cache locales.

## Limites actuelles / non inclus
- Mobile Money: non implémenté.
- Certaines fonctionnalités du cahier global (ex: affiliation avancée, badges fidélité avancés, app mobile) restent hors scope actuel.





curl -X POST http://localhost:3000/api/admin/bootstrap 
-H "Content-Type: application/json" 
  -d '{"email":"ab@gmail.com","secret":"hrwXCqpJWz+oCzBhqM1HpYvxDViT8i4gDTiH1bzRzCL4FcpZbh1eqexGQftDoE7J"}'