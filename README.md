# DT-THAU — site web

Site de DT-THAU, organisme de formation en transition écologique et RSE pour les PME et TPE
du Bassin de Thau (Mèze, Hérault).

Construit avec [Astro](https://astro.build) en TypeScript.

## Prérequis

- Node.js 26 (version indiquée dans `.nvmrc` ; minimum 24, pour le module `node:sqlite`)

## Installation

```bash
npm ci
```

## Commandes

| Commande          | Rôle                                                  |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | serveur de développement sur <http://localhost:4321>  |
| `npm run build`   | build de production dans `dist/`                      |
| `npm run preview` | sert le build de production en local                  |
| `npm start`       | lance le serveur Node du build (`PORT`, `HOST`)       |
| `npm run check`   | vérification des types (`astro check`)                |
| `npm run lint`    | lint et contrôle du formatage (Biome)                 |
| `npm run format`  | formate le code (Biome)                               |

## État actuel : wireframe

Le site est au stade de wireframe : structure et contenus sans graphisme. Le bandeau bleu
en haut de page et les notes (« Note », « Proposition ») expliquent le rôle de chaque bloc ;
ils seront retirés avec la direction artistique. Les formulaires ne sont pas encore branchés
(boutons d’envoi désactivés).

## Modifier le contenu

Le build (`npm run build`) vérifie tous les fichiers de contenu : une erreur de saisie
l’arrête avec un message qui indique le champ fautif. Les espaces insécables avant
`: ; ? !` et dans les guillemets `« »` sont ajoutés automatiquement.

### Formations

Un fichier Markdown par formation dans `src/content/formations/`. Pour en ajouter une,
copier un fichier existant et le renommer : le nom du fichier devient l’ancre de la
formation (`/formations/#nom-du-fichier`).

| Champ | Contenu |
| --- | --- |
| `title`, `objective`, `audience`, `duration`, `format`, `benefit` | obligatoires |
| `need` | `comprendre`, `demarche-rse`, `priorites` ou `action` |
| `order` | position dans le besoin (croissante) |
| `prerequisites`, `access`, `price`, `methods`, `assessment`, `accessibility` | facultatifs : informations exigées par Qualiopi, affichées seulement si elles sont remplies |

### Questionnaire

Les questions sont dans `src/content/surveys.json`, regroupées en sections. Types
disponibles : `short-text`, `long-text`, `single-choice`, `multiple-choice` et `scale`
(avec `min`, `max`, `minLabel`, `maxLabel`). `required: true` rend une question
obligatoire (sauf pour `multiple-choice`).

Chaque `id` de question doit être unique et n’utiliser que des minuscules, des chiffres et
des tirets. Il sert de clé pour enregistrer les réponses : ne plus le modifier une fois le
questionnaire publié. L’`id` `email` est réservé.

### Coordonnées et informations légales

Dans `src/data/site.ts`. Une valeur `null` s’affiche comme un champ à compléter.

### Contenus provisoires

- `[À COMPLÉTER : description]` s’affiche surligné en jaune dans les champs des formations
  et dans la durée du questionnaire ; ailleurs, il reste visible tel quel.
- `[EXEMPLE]` en début de titre marque un contenu d’exemple à remplacer.

## Build de production

Le site est servi par le serveur Node autonome d’Astro : les pages sont pré-générées, seuls
les formulaires s’exécutent côté serveur. Pour un build destiné au domaine public, indiquer
le domaine (sans `https://`) ; derrière le reverse proxy, Astro ne fait confiance qu’à ce
domaine pour l’hôte, le protocole et l’adresse IP transmis :

```bash
SITE_DOMAIN=dt-thau.fr npm run build
```

## Formulaires et données

Le formulaire de contact et le questionnaire enregistrent les envois dans une base SQLite
(`submissions.db`), dans le dossier indiqué par la variable `DATA_DIR` (par défaut
`./data`, ignoré par git). Voir [.env.example](.env.example).

Les réponses au questionnaire sont enregistrées sans adresse IP ni heure (la date du jour
seulement) ; l’adresse e-mail n’est conservée que si la case de consentement est cochée.

Protections : validation côté serveur, champ piège et délai minimal contre les robots,
5 envois valides au plus par formulaire, par adresse IP et par tranche de 10 minutes, contrôle de
l’origine des envois (Astro), corps de requête limité à 100 Ko.

En local, ouvrir le site sur <http://localhost:4321> (et non `127.0.0.1`) : sans
`SITE_DOMAIN`, Astro n’accepte les envois que depuis `localhost`.

### Exporter les envois

Le script [scripts/export-submissions.mjs](scripts/export-submissions.mjs) produit un
fichier CSV lisible par Excel (séparateur `;`, UTF-8) à partir de la base :

```bash
node scripts/export-submissions.mjs contact > messages.csv
```

```bash
node scripts/export-submissions.mjs survey > reponses.csv
```

Les cellules qui commencent par `=`, `+`, `-` ou `@` sont préfixées d’une apostrophe, pour
qu’un tableur n’exécute jamais une formule saisie par un visiteur. Ces exports contiennent
des données personnelles : à ne pas laisser traîner ni envoyer en clair.

## Déploiement (Docker, derrière Caddy)

Le site tourne seul dans son conteneur (`dt-thau-web`). Il ne publie aucun port : seul le
reverse proxy Caddy le joint, par un réseau Docker externe. Le conteneur est durci : système
de fichiers en lecture seule, aucune capacité Linux, utilisateur non root, sans npm,
mémoire, CPU et nombre de processus limités. Seul le volume `dt-thau-data` (la base
SQLite) est inscriptible.

Conseil : donner à ce site son propre réseau, partagé uniquement avec Caddy (par exemple
`PROXY_NETWORK=dt-thau-proxy`), plutôt qu’un réseau commun à tous les sites. Les autres
conteneurs ne pourront alors ni joindre ce site directement, ni lui envoyer une fausse
adresse IP de visiteur.

Sur le serveur, dans le dossier du site :

1. Copier `.env.example` en `.env`, puis renseigner `SITE_DOMAIN` (domaine public) et
   `PROXY_NETWORK` (réseau Docker partagé avec Caddy). Créer ce réseau s’il n’existe pas
   (`docker network create dt-thau-proxy`) et y rattacher le conteneur Caddy.
2. Construire et démarrer :

   ```bash
   docker compose up -d --build
   ```

3. Ajouter à la configuration de Caddy le bloc de
   [deploy/Caddyfile.example](deploy/Caddyfile.example), en remplaçant le domaine
   d’exemple, puis recharger Caddy. Ce bloc ajoute aussi les en-têtes de sécurité HTTP
   (HSTS, `nosniff`, interdiction d’afficher le site dans un cadre…).
4. Mettre à jour le site : `git pull`, puis la même commande `docker compose up -d --build`.

Exporter les envois depuis le conteneur (`-T` évite les fins de ligne du terminal) :

```bash
docker compose exec -T web node scripts/export-submissions.mjs survey > reponses.csv
```

Sauvegarder la base (copie du dossier de données, à faire de préférence hors des heures
d’affluence) :

```bash
docker cp dt-thau-web:/app/data ./sauvegarde-dt-thau
```
