# BadWallet Web Dashboard

Application Angular (SPA) de gestion de portefeuilles électroniques. Elle consomme la **BadWallet API** et le **Payment Service** exposés sur `http://localhost:8080`.

Deux espaces :

| Espace | Rôle | Fonctions |
|--------|------|-----------|
| **Agent de guichet** | gestion opérationnelle | listing paginé, création, recherche par téléphone, dépôt, retrait |
| **Client** | self-service | tableau de bord (solde temps réel, graphiques), transfert, factures (consultation/paiement), historique |

## Pré-requis

- Node 18+ et Angular CLI 19
- La **BadWallet API** doit tourner sur `http://localhost:8080` (le `payment-service` sur `8081` pour les factures)

## Lancer

```bash
npm install
npm start        # ng serve sur http://localhost:4200
```

Le fichier `proxy.conf.json` redirige `/api` vers `http://localhost:8080` : aucune configuration CORS n'est nécessaire côté back-end.

### Connexion

Session sécurisée par rôle : un token (style JWT, avec expiration) est émis à la connexion, attaché aux requêtes par un interceptor, et les routes sont protégées par des guards. L'API n'exposant pas d'authentification, la vérification des identifiants est faite côté front avec des comptes de démonstration.

- **Client** : téléphone + code PIN, ex. `+221770000003` / `1234`.
- **Agent** : identifiant + mot de passe, `agent` / `agent123`.

## Aperçu

Une galerie de captures des interfaces et fonctionnalités est disponible dans [`captures/`](captures/README.md).

## Architecture

```
src/app/
  core/        services API, état (Signals), session, thème, interceptors (erreurs, chargement), guards par rôle
  shared/      composants UI réutilisables (modale, icônes, toasts), pipes (xof, phone), validateurs
  layout/      shell (sidebar, header avec solde temps réel)
  features/    auth, agent (wallets), client (dashboard, transfer, billing, transactions)
```

- **State management** par **Signals** : le solde se met à jour dans le header après chaque opération, sans rechargement.
- **Reactive Forms** avec validateurs synchrones et asynchrones (vérification de l'existence du destinataire).
- **Interceptors** : gestion centralisée des erreurs (toasts) et indicateur de chargement global.
- **Guards** : routes protégées par rôle.
- Design system maison (Tailwind CSS), thème clair/sombre.

### Fonctionnalités complémentaires

- **Tableau de bord** : donut revenus/dépenses et graphique de flux mensuel (entrées/sorties sur les six derniers mois), en SVG.
- **Session** : expiration active du token avec déconnexion automatique et redirection vers la connexion.
- **Tri des colonnes** : tri serveur (paramètre `sort` de la pagination Spring) sur les portefeuilles, tri client sur les transactions.
- **Confirmation** : boîte de dialogue avant les actions sensibles (retrait, paiement, déconnexion).

## Organisation Git

- `main` : version stable et livrable.
- `develop` : intégration des fonctionnalités terminées et testées.
- `feature/*` : une branche par fonctionnalité, fusionnée dans `develop`.
