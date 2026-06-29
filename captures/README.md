# Galerie des interfaces et fonctionnalités

Captures de l'application **BadWallet Web Dashboard** (thème clair par défaut, avec variantes sombres). Comptes de démonstration : client `+221770000003` / PIN `1234`, agent `agent` / `agent123`.

## Authentification

### Connexion — espace client
Formulaire client (téléphone + code PIN) et panneau de marque avec carte de solde.

![Connexion client](01-connexion-client.png)

### Connexion — espace agent
Bascule de rôle vers l'agent (identifiant + mot de passe).

![Connexion agent](02-connexion-agent.png)

### Connexion — identifiants invalides
Message d'erreur d'authentification.

![Erreur d'identifiants](03-connexion-erreur-identifiants.png)

### Connexion — thème sombre
La page de connexion en thème sombre.

![Connexion sombre](04-connexion-theme-sombre.png)

## Espace client

### Tableau de bord
Solde temps réel, donut revenus/dépenses, graphique de flux mensuel et activité récente.

![Tableau de bord](05-tableau-de-bord.png)

### Tableau de bord — thème sombre
Le même tableau de bord en thème sombre.

![Tableau de bord sombre](06-tableau-de-bord-theme-sombre.png)

### Transactions
Liste paginée avec filtres par type et par dates.

![Transactions](07-transactions.png)

### Transactions — tri par montant
Tri des colonnes (ici le montant, décroissant) avec indicateur de sens.

![Tri des transactions](08-transactions-tri-montant.png)

### Transfert — destinataire vérifié
Validation asynchrone du destinataire (« Destinataire trouvé »).

![Transfert destinataire trouvé](09-transfert-destinataire-trouve.png)

### Factures — sélection
Sélection multiple de factures impayées avec total à régler.

![Factures sélection](10-factures-en-cours-selection.png)

### Factures — confirmation de paiement
Boîte de dialogue de confirmation avant le paiement.

![Confirmation paiement](11-factures-confirmation-paiement.png)

### Factures — historique
Historique des paiements de factures.

![Historique factures](12-factures-historique.png)

## Espace agent

### Portefeuilles
Liste paginée des comptes clients.

![Portefeuilles](13-portefeuilles.png)

### Portefeuilles — tri par solde
Tri serveur sur la colonne solde.

![Tri portefeuilles](14-portefeuilles-tri-solde.png)

### Portefeuilles — recherche
Recherche d'un client par téléphone et carte résultat avec actions.

![Recherche portefeuille](15-portefeuilles-recherche.png)

### Portefeuilles — création
Modale de création d'un nouveau portefeuille.

![Création portefeuille](16-portefeuilles-modale-creation.png)

### Portefeuilles — confirmation de retrait
Dialogue de confirmation (variante d'alerte) avant un retrait.

![Confirmation retrait](17-portefeuilles-confirmation-retrait.png)

## Fonctionnalités transverses

### Confirmation de déconnexion
Dialogue de confirmation avant de quitter la session.

![Confirmation déconnexion](18-confirmation-deconnexion.png)

### Expiration active de la session
Déconnexion automatique et redirection vers la connexion à l'échéance du token.

![Expiration de session](19-expiration-session.png)
