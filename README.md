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
- **Client** : choisir « Client » et saisir un numéro existant, ex. `+221770000003`.
- **Agent** : choisir « Agent » puis « Continuer comme agent ».

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

## Organisation Git

- `main` : version stable et livrable.
- `develop` : intégration des fonctionnalités terminées et testées.
- `feature/*` : une branche par fonctionnalité, fusionnée dans `develop`.
