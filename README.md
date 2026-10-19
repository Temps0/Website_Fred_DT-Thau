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

## État actuel : maquette

La charte graphique est appliquée ; les textes viennent du brief et des documents de
DT-Thau (catalogue, offre CAP TRANSITION Étudiants) et restent à faire valider. Le bandeau
bleu en haut de page et les notes (« Note », « Proposition ») expliquent les choix et les
points à valider ; ils seront retirés avant la mise en ligne. Les formulaires fonctionnent
et enregistrent les envois (voir plus bas).

## Modifier le contenu

Le build (`npm run build`) vérifie tous les fichiers de contenu : une erreur de saisie
l’arrête avec un message qui indique le champ fautif. Les espaces insécables avant
`: ; ? !`, dans les guillemets `« »` et entre un nombre et son unité (`3 h`, `600 €`)
sont ajoutés automatiquement.

### Programmes CAP TRANSITION

La page `/programmes/` présente les trois publics et leurs programmes.

- **Modules** : un fichier Markdown par module dans `src/content/modules/`. Pour en
  ajouter un, copier un fichier existant et le renommer : le nom du fichier devient l’ancre
  du module (`/programmes/#nom-du-fichier`).
- **Publics et modalités** (présentiel, inter/intra) : `src/data/audiences.ts`.
- **Offre étudiants** (formules, tarifs, conditions) :
  `src/data/cap-transition-etudiants.ts`.

| Champ d’un module | Contenu |
| --- | --- |
| `title`, `tagline`, `duration`, `objective`, `skill` | obligatoires ; `skill` est la « compétence acquise » |
| `theme`, `verb`, `pathStep` | badge (« Climat »), verbe (« Décoder ») et étape du parcours (« Comprendre la menace ») |
| `topics` | liste des points du programme |
| `icon` | pictogramme, parmi ceux de `src/lib/icons.ts` |
| `order` | position dans le parcours (croissante) |
| `prerequisites`, `access`, `price`, `methods`, `assessment`, `accessibility` | facultatifs : informations exigées par Qualiopi, affichées seulement si elles sont remplies |

Les pictogrammes viennent de [Lucide](https://lucide.dev) (licence ISC). Pour en ajouter
un, l’importer dans `src/lib/icons.ts` sous son nom Lucide.

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

- `[À COMPLÉTER : description]` s’affiche surligné en jaune dans les champs facultatifs des modules
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
fichier CSV lisible par Excel (séparateur `;`, UTF-8) à partir de la base, et indique le
nombre d’envois exportés :

```bash
node scripts/export-submissions.mjs contact messages.csv
```

```bash
node scripts/export-submissions.mjs survey reponses.csv
```

Sous Windows, toujours donner le nom du fichier comme ci-dessus : une redirection `>` dans
Windows PowerShell réécrit le texte en UTF-16, qu’Excel lit mal, et rend une sauvegarde
inutilisable. Si le fichier est encore ouvert dans Excel, le fermer avant de relancer.

Les cellules qui commencent par `=`, `+`, `-` ou `@` sont préfixées d’une apostrophe, pour
qu’un tableur n’exécute jamais une formule saisie par un visiteur. Ces exports contiennent
des données personnelles : à ne pas laisser traîner ni envoyer en clair. Les fichiers
`.csv` et `.db` sont ignorés par git, pour qu’ils ne finissent jamais dans le dépôt.

### Supprimer des envois

Pour répondre à une demande d’effacement, ou appliquer les durées de conservation de la
politique de confidentialité, [scripts/delete-submissions.mjs](scripts/delete-submissions.mjs)
supprime définitivement des envois. Le contenu est aussi écrasé sur le disque, y compris
dans le journal de la base ; si le script signale que la base était occupée, le relancer un
peu plus tard :

```bash
node scripts/delete-submissions.mjs --email personne@example.fr
```

```bash
node scripts/delete-submissions.mjs contact --older-than 1095
```

Variantes : `contact <n°>` ou `survey <n°>` supprime un envoi précis (numéro de l’export),
`survey --older-than <jours>` purge les anciennes réponses. Avec `--email`, les messages de
contact de cette adresse sont supprimés, et l’adresse est retirée des réponses au
questionnaire (qui redeviennent sans lien avec la personne).

Les sauvegardes faites avant une suppression contiennent encore les données supprimées :
les conserver pour une durée limitée, puis les détruire.

### Sauvegarder et restaurer

[scripts/backup-database.mjs](scripts/backup-database.mjs) écrit une copie cohérente de la
base, prise pendant que le serveur tourne :

```bash
node scripts/backup-database.mjs sauvegarde.db
```

La copie contient des données personnelles : la conserver avec les mêmes précautions.

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

Exporter les envois depuis le conteneur : sans nom de fichier, le script écrit sur la
sortie standard, que le shell du serveur (bash) redirige vers un fichier sur l’hôte
(`-T` évite les fins de ligne du terminal) :

```bash
docker compose exec -T web node scripts/export-submissions.mjs survey > reponses.csv
```

Les scripts de gestion des données s’utilisent de la même façon, par exemple :

```bash
docker compose exec -T web node scripts/backup-database.mjs > sauvegarde.db
```

```bash
docker compose exec web node scripts/delete-submissions.mjs --email personne@example.fr
```

Restaurer une sauvegarde : arrêter le site, restaurer avec
[scripts/restore-database.mjs](scripts/restore-database.mjs) (qui vérifie le fichier avant
de remplacer la base), redémarrer.

```bash
docker compose stop web
```

```bash
docker compose run --rm --no-deps -v "$PWD/sauvegarde.db:/restore.db:ro" web node scripts/restore-database.mjs /restore.db
```

```bash
docker compose start web
```
