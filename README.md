# Juste ce qu’il faut

Une petite application web locale pour préparer une liste de courses à partir de références personnelles.

## Utilisation

Double-cliquer sur `start_app.bat`. Le navigateur s’ouvre automatiquement ; garder la petite fenêtre du serveur ouverte pendant l’utilisation.

L’ouverture directe de `index.html` reste possible, mais les boutons qui écrivent la sauvegarde dans le dossier nécessitent le lanceur.

- Choisir un endroit, puis vérifier les produits un par un avec **Pas besoin** ou **Il en faut**.
- Les cartes peuvent aussi être glissées à gauche ou à droite, comme une liste « Tinder ».
- Utiliser l’onglet **Mes produits** pour créer ou modifier les références, le minimum à garder en stock et la quantité habituelle à acheter.
- Ajouter, renommer ou supprimer les endroits et catégories depuis le gestionnaire du même onglet.
- Télécharger une sauvegarde locale au format JSON et la restaurer depuis l’onglet **Mes produits**.
- Enregistrer ou charger directement `data/catalog-backup.json` avec les boutons de sauvegarde intégrée. Ce fichier appartient au dépôt et peut être versionné avec Git.
- Cliquer sur **Partager ma liste** pour choisir Messages, WhatsApp, Notes ou une autre application du téléphone.
- Si le partage natif n’est pas disponible, la liste est copiée automatiquement.

Les produits restent enregistrés dans le navigateur pendant l’utilisation. Le lanceur local sert uniquement à lire et écrire la copie suivie par Git dans le dossier du projet ; aucun compte ni service internet n’est nécessaire.
