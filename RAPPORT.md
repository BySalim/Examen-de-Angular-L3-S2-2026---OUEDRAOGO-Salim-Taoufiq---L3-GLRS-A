# Rapport technique — BadWallet Web Dashboard

## Choix d'architecture

**Angular standalone + Signals.** L'application est construite sans NgModules, en composants standalone (Angular 19). La gestion d'état repose sur les **Signals** plutôt que sur un store externe : un `BalanceStore` expose le solde sous forme de signal, mis à jour après chaque opération grâce aux montants `balanceAfter` renvoyés par l'API. Le header reflète donc le solde en temps réel sans rechargement ni appel supplémentaire.

**Découpage core / shared / features.** Le dossier `core` centralise l'infrastructure (services d'API, session, thème, interceptors, guards) ; `shared` regroupe les briques réutilisables (modale, icônes, toasts, pipes `xof` et `phone`, validateurs) ; `features` contient les pages métier par espace (agent, client). Cette séparation rend chaque fonctionnalité isolée et testable.

**Communication avec le back-end.** Les services `WalletApiService` et `BillingApiService` encapsulent tous les appels HTTP via des URLs relatives `/api/...`. Un proxy de développement (`proxy.conf.json`) redirige vers `http://localhost:8080`, ce qui évite toute configuration CORS côté back-end. Les erreurs HTTP sont traitées par un interceptor unique qui affiche un toast contextuel (« Fonds insuffisants », « Service indisponible »…), et un second interceptor pilote un indicateur de chargement global.

**Sécurité par rôle.** L'API ne fournissant pas d'authentification, une session est simulée (rôle Agent, ou Client identifié par son téléphone) et persistée en `localStorage`. Des **guards** fonctionnels protègent les routes selon le rôle.

**Design system.** Un thème maison (« Kóra ») bâti sur Tailwind CSS expose des tokens de couleurs en variables CSS, permettant une bascule clair/sombre instantanée. Les icônes et les graphiques (donut revenus/dépenses) sont réalisés en SVG sans dépendance externe, pour un rendu cohérent et léger.

## Difficultés rencontrées

- **Validation asynchrone sans bruit visuel.** La vérification « le destinataire existe » interroge l'API à chaque frappe ; pour éviter une avalanche de toasts d'erreur, un `HttpContextToken` marque ces requêtes comme silencieuses et l'interceptor les ignore. Le validateur asynchrone est par ailleurs temporisé (`timer`) pour limiter les appels.

- **Adaptation aux contrats réels de l'API.** L'endpoint `/balance` renvoie un objet et non un nombre brut : le service mappe la réponse vers le solde attendu. De même, l'historique des paiements de factures est reconstruit à partir des transactions de type `PAYMENT`, l'API ne renvoyant que les factures impayées.

- **Identifiants multiples.** Le client est identifié par téléphone côté portefeuille mais par code (`WLT-...`) côté factures ; la session conserve les deux pour aiguiller correctement les appels. Le caractère `+` des numéros est géré tel quel dans les chemins.

- **Paiement multi-factures.** La sélection pouvant mêler plusieurs fournisseurs, les factures sont regroupées par fournisseur avant d'être réglées en parallèle, puis le solde est rafraîchi.

## Méthode

Développement en Git Flow : une branche `feature/*` par fonctionnalité, fusionnée dans `develop` après vérification de la compilation, `main` recevant la version livrable.
