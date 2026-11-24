# DT-Thau : points à fournir et à valider avant la mise en ligne

Ce document remplace les notes de la maquette. Il liste ce que le site attend encore de
DT-Thau : des informations à fournir, des choix à valider et des vérifications juridiques.
Tant que la première partie n’est pas complète, construire le site sans `SITE_INDEXABLE=true`
(voir le README) : il reste alors hors des moteurs de recherche.

Sur le site, chaque information manquante s’affiche en jaune, entre crochets :
`[À COMPLÉTER : …]`. Les valeurs se modifient dans `src/data/site.ts` (coordonnées et
identité légale), `src/content/` (modules et questionnaire) et `src/data/` (offres).

## 1. Obligatoire avant la mise en ligne

Mentions légales (`/mentions-legales/`) :

- [ ] Numéro de TVA intracommunautaire.
- [ ] Nom du directeur de la publication.
- [ ] Numéro de déclaration d’activité de l’organisme de formation (attribué par la DREETS).
      Dès qu’il est affiché, la formule prévue par l’article L6352-12 du Code du travail
      l’accompagne : à confirmer lors de la validation juridique.
- [ ] Hébergeur : nom ou raison sociale, adresse et téléphone. Le site est hébergé sur un
      serveur personnel : la personne qui l’héberge doit y figurer.
- [ ] Crédits photographiques : auteur du portrait du fondateur et son accord.

Politique de confidentialité (`/confidentialite/`) et formulaires :

- [ ] Durée de conservation des messages de contact (la CNIL recommande par exemple 3 ans
      après le dernier contact).
- [ ] Durée de conservation des réponses au questionnaire et des adresses e-mail associées.
- [ ] Durée de conservation des journaux techniques (de 6 mois à 1 an selon la CNIL).
- [ ] Prestataires réels : hébergement, messagerie et envoi des e-mails, et transferts
      éventuels hors de l’Union européenne.
- [ ] Délai de réponse annoncé après l’envoi du formulaire de contact.
- [ ] Date de dernière mise à jour de la politique.
- [ ] Validation des deux textes juridiques par le responsable du site, idéalement avec un
      professionnel du droit.

## 2. Contenus à fournir

- [ ] Un portrait du fondateur en bonne définition (au moins 1 200 px de haut). La photo
      actuelle, tirée de l’offre étudiants, ne fait que 257 × 305 px.
- [ ] Des photos réelles : le Bassin de Thau, une intervention en entreprise ou en classe,
      le fondateur sur le territoire. En attendant, le site n’a pas d’autre image que le
      portrait du fondateur : ses sections reposent sur les aplats de couleur de la charte.
- [ ] Le logo en meilleure définition : la barre de navigation affiche `DTT_logo.png`
      (782 × 793 px), recadré et réduit à 512 px. Il tient à la taille affichée (48 px),
      mais un fichier vectoriel ou plus grand serait préférable pour les usages futurs
      (favicon, impression, réseaux sociaux).
- [ ] Qui sommes-nous : l’histoire du projet (le déclic, le constat, l’envie), le parcours
      du fondateur, ses compétences, ses diplômes et certifications vérifiables.
- [ ] Un exemple concret par principe de l’approche, tiré d’une formation.
- [ ] Le contenu des programmes TPE / PME et Collectivités & associations : ils sont
      présentés « sur devis » en attendant.
- [ ] Les questions réelles du questionnaire (celles en ligne sont des exemples) et sa durée
      estimée.

## 3. Offre et mentions commerciales

- [ ] Régime de TVA : un organisme de formation peut être exonéré (CGI, art. 261-4-4° a) ou
      en franchise en base (art. 293 B). « HT » serait alors trompeur : afficher « net de
      taxe » avec la mention légale.
- [ ] Financement : le catalogue annonce « Financements OPCO / Région Occitanie possibles ».
      Un financement OPCO exige la certification Qualiopi : mention à confirmer.
- [ ] Type d’attestation remise (participation ou formation).
- [ ] Noms des formules : le site reprend l’offre commerciale (Découverte, Intermédiaire,
      Intégral) ; le catalogue dit « Double Module » et « Parcours Complet ».
- [ ] Prix barrés de l’offre (750, 1 300 et 1 800 € HT) : non affichés, car un prix de
      référence barré doit avoir été réellement pratiqué.
- [ ] Simulateur de la page Programmes : il compte une session par groupe de 30 étudiants au
      plus, chaque session au prix de la formule. À confirmer.

## 4. Choix de textes à valider

- [ ] Titre de l’accueil, raccourci en « Accélérer la transition » (le catalogue dit
      « Accélérer la transition écologique sur le Bassin de Thau »). La phrase dessous nomme
      les publics : « les entreprises, les écoles et les collectivités » ; le catalogue dit
      « TPE / PME » et « Collectivités & associations ».
- [ ] Titre du questionnaire, raccourci en « Quels sont vos besoins ? » (il était
      « Transition écologique : quels besoins pour les entreprises du Bassin de Thau ? »).
- [ ] « Qui sommes-nous ? » ou « Qui suis-je ? » : avec un fondateur seul, le « je » est
      plus direct.
- [ ] Les descriptions des trois valeurs (Pédagogie, Pragmatisme, Responsabilité), et
      l’explication du principe « Flexible », rédigées d’après le brief et le catalogue.
- [ ] Sur la page Approche, « des étudiants » est devenu « des participants », pour couvrir
      les trois publics.
- [ ] Adresse sur la page Contact : si le siège est une adresse personnelle, elle reste
      obligatoire dans les mentions légales mais peut être retirée de la page Contact.

## 5. Technique

- [ ] Une adresse e-mail professionnelle, pour recevoir une notification à chaque message
      (les envois sont aujourd’hui enregistrés sur le serveur seulement, voir le README).
- [ ] Le nom de domaine, à réserver au nom de DT-Thau.
- [ ] Un envoi réel du formulaire de contact une fois le site en ligne, avec l’accord de
      DT-Thau, pour vérifier la réception.
