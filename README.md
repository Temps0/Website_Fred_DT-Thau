# DT-THAU — site web

Site de DT-THAU, organisme de formation en transition écologique et RSE pour les PME et TPE
du Bassin de Thau (Mèze, Hérault).

Construit avec [Astro](https://astro.build) en TypeScript.

## Prérequis

- Node.js 26 (version indiquée dans `.nvmrc` ; minimum 22.12)

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
