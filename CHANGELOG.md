# 12-06-2026

- 15:31 - Refonte du jeu d’icônes de navigation de l’application avec retour au set PNG partagé utilisé sur les écrans principaux afin d’uniformiser durablement la navigation basse.
- 16:17 - Intégration du modèle 3D `public/models/star.glb` sur la page `/[locale]/home`, avec agrandissement et rotation lente pour remplacer la composition centrale précédente.

# 15-06-2026

- 10:19 - Mise en place du sélecteur de langue interactif sur `/[locale]/home`, avec drapeaux, changement réel de locale et comportement survol/clic stabilisé.
- 10:46 - Création de la page `/[locale]/menu` en reproduction FileMaker avec en-tête daté, panneau central de consultation, boutons d’accès rapide et navigation basse.
- 15:49 - Mutualisation des composants `stavnet-header` et `stavnet-footer`, puis harmonisation de leur intégration sur `/[locale]`, `/[locale]/home` et `/[locale]/menu`.
- 19:58 - Refonte interactive de la zone centrale de `/[locale]/menu` avec familles `Books`, `Persons` et `Organizations` affichées hors de la card et sous-menus dynamiques au survol, au focus et au clic.
- 20:03 - Ajout des animations GSAP globales sur le segment `/[locale]`, avec transitions d’entrée pour les pages, headers, footers et panneaux centraux.

# 16-06-2026

- 09:28 - Création de la page `/[locale]/search` en reproduction FileMaker, avec raccordement de la navigation existante et messages i18n dans les six langues.
- 10:03 - Finalisation responsive et visuelle de `/[locale]/search`, avec alignement du formulaire, du panneau d’aide et de la navigation basse.
- 14:21 - Création de la page `/[locale]/books` avec structure de fiche livre FileMaker, onglets fonctionnels, navigation dédiée et traductions complètes.
- 15:49 - Refonte majeure de `/[locale]/books` pour améliorer sa lisibilité et son responsive, avec données factices de contrôle, tableaux mobiles dédiés et meilleure répartition des blocs.
- 16:18 - Remplacement complet de `/[locale]/persons` par une fiche auteur inspirée de la maquette FileMaker, avec onglets, panneau biographique, bibliographie et footer STAVNET.

# 17-06-2026

- 09:57 - Harmonisation finale des fiches `/[locale]/books` et `/[locale]/persons`, avec recalage des proportions, rapprochement des panneaux latéraux vers les blocs centraux et nettoyage des éléments secondaires inutiles.
- 11:10 - Création complète de la page `/[locale]/orgs` en reproduction FileMaker, avec fiche organisme à onglets, faux contenus structurés, navigation STAVNET et traductions dédiées dans les six langues.
- 11:30 - Renforcement du responsive des fiches `/[locale]/books`, `/[locale]/persons` et `/[locale]/orgs` avec conservation d’onglets défilants sur mobile, remplacement des grands tableaux de `persons` et `orgs` par des cartes lisibles sur petit écran, masquage des asides purement desktop hors grand écran et maintien d’un état propre validé par `pnpm lint`.
- 14:28 - Recalage du fond illustré de la card centrale sur `/[locale]/menu` avec un crop orienté vers le haut afin d’afficher davantage la zone de ciel bleu et moins la partie basse du visuel.
- 16:00 - Remplacement de `/[locale]/orgs` par une vraie page liste FileMaker d’organismes, avec routage de la fiche détail sur `/[locale]/orgs/details`, lignes cliquables vers le détail et nouvelles traductions de listing dans les six langues.

# 18-06-2026

- 11:00 - Création des vraies pages liste `/[locale]/books` et `/[locale]/persons` en reproduction FileMaker, avec déplacement des fiches détail vers `/[locale]/books/details` et `/[locale]/persons/details`, tableaux cliquables vers les fiches et nouveaux messages i18n dédiés.
- 11:55 - Reprise du groupe `/[locale]/persons` avec nettoyage du code, conversion de la liste en Server Component, remplacement du tableau mobile par des cartes tactiles sur `/[locale]/persons` et durcissement du responsive de `/[locale]/persons/details` avec suppression des styles inline, bibliographie mobile dédiée et meilleure tenue des panneaux sur petit écran.
- 11:58 - Nettoyage et renforcement du responsive mobile du groupe `/[locale]/orgs`, avec vraie variante cartes pour la liste, suppression des styles inline et ajustement de la fiche `/[locale]/orgs/details` pour éviter les débordements horizontaux et améliorer les cibles tactiles.
- 11:58 - Renforcement du responsive mobile et nettoyage du groupe `/[locale]/books`, avec remplacement du tableau mobile de listing par des cartes tactiles sur `/[locale]/books`, durcissement des blocs de `/[locale]/books/details` contre les débordements horizontaux et amélioration de la densité mobile sans casser le rendu desktop.
- 12:01 - Allègement des cartes mobiles de `/[locale]/books` pour limiter les informations visibles au premier coup d’oeil et ajout d’un bouton `voir plus` menant vers `/[locale]/books/details`.
- 12:05 - Enrichissement massif de la liste `/[locale]/books` avec davantage de données factices et ajout d’une pagination visuelle customisée au style STAVNET pour répartir le tableau sur plusieurs pages.
- 12:09 - Recomposition du header mobile partagé STAVNET avec une première rangée compacte logo-cartouche, un bloc titre mieux hiérarchisé et des tailles de titres ajustées sur `/[locale]/books`, `/[locale]/search`, `/[locale]/orgs`, `/[locale]/persons` et `/[locale]/home` pour améliorer nettement la lisibilité sur petit écran.
- 12:26 - Alignement des listes `/[locale]/persons` et `/[locale]/orgs` sur le nouveau standard de `/[locale]/books`, avec enrichissement des données factices, pagination STAVNET partagée et suppression des grands vides bas dans les tableaux desktop.
- 14:41 - Remise en état du pipeline de build avec suppression de la dépendance aux polices Google téléchargées à la compilation dans `src/app/[locale]/layout.tsx`, remplacement par des variables de fontes locales dans `src/styles/globals.css`, migration de `src/middleware.ts` vers `src/proxy.ts` pour supprimer l’avertissement Next.js, puis validation par `pnpm lint` et `pnpm build`.
