# CRÉNO Flutter

Portage Flutter de l’application mobile Expo située dans `mobile/`.

## Configuration et lancement

Depuis `mobille_f/`, lance l’application en fournissant l’adresse de l’API et la clé publique Stripe :

```sh
flutter run \
  --dart-define=API_BASE_URL=https://votre-api.example \
  --dart-define=STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Pour un émulateur Android, l’API exécutée sur l’ordinateur est généralement accessible sur `http://10.0.2.2:3000`. Pour un appareil physique, utilise l’adresse IP locale de l’ordinateur. N’utilise jamais une clé secrète Stripe dans l’application.

L’application comprend le catalogue et le détail des cours, la connexion et l’inscription, les réservations et paiements, ainsi que l’espace propriétaire pour gérer studios et cours.
