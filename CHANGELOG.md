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
- 15:20 - Création de la page `/[locale]/definition` en reproduction FileMaker, avec double champ de contexte définition/mot-clé, tableau de titres reliés au mot-clé et intégration i18n dans les six langues.
- 15:44 - Création de la sous-page `/[locale]/books/details/back-cover` pour l’onglet `Quatrième de couverture`, avec nouvelle fiche dédiée inspirée de la maquette FileMaker et raccordement de l’onglet depuis la fiche livre principale.
- 16:11 - Refonte visuelle de `/[locale]/books/details/back-cover` pour rapprocher la sous-page de la capture FileMaker, avec vraie colonne de 4e de couverture, tables d’informations plus denses, pastilles rouges et rééquilibrage complet du bloc central.

# 19-06-2026

- 10:44 - Recalage majeur de la fiche `/[locale]/books/details`, avec remplacement du panneau gauche par une vraie couverture de livre et un résumé agrandis, recentrage de toute la composition desktop dans la page, resserrement de la colonne verticale droite contre le bloc central et ajustement des proportions générales pour mieux coller à la référence FileMaker.
- 10:52 - Refonte du layout de `/[locale]/books/details/back-cover` pour l’aligner sur la fiche livre retouchée, avec composition desktop recentrée, panneau gauche resserré, bloc principal compacté et réorganisation de la colonne verticale droite selon la maquette FileMaker de référence.
- 11:34 - Refonte visuelle majeure de `/[locale]/books/details/back-cover` pour coller plus strictement à la capture FileMaker, avec fausse quatrième de couverture textuelle à gauche, tables centrales aplaties et densifiées, bandeau vertical droit recalé et bloc bas de texte rééquilibré.
- 11:39 - Recalage supplémentaire de `/[locale]/books/details/back-cover` pour rapprocher plus strictement les proportions du screen FileMaker, avec groupe haut resserré, suppression du grand vide bleu sous les tables, bloc bas affiné et colonne verticale droite compactée.
- 11:51 - Recomposition plein cadre de `/[locale]/books/details/back-cover` pour coller à l’écran FileMaker observé dans le browser desktop 1920x1080, avec retrait du header/footer STAVNET sur cette sous-page, fausse 4e de couverture réagrandie, extension quasi plein écran des tableaux et bloc bas élargi comme sur la capture de référence.
- 11:55 - Réalignement structurel de `/[locale]/books/details/back-cover` sur la logique de `/[locale]/books/details`, avec réintégration du header et du footer STAVNET, retour à `book-cover.jpg` dans la colonne gauche et reprise du même squelette desktop pour garder une fiche cohérente avec le reste du parcours livre.
- 12:19 - Création de la sous-page `/[locale]/books/details/press-critiques` dans la continuité logique de `books/details`, avec nouveau composant dédié inspiré de la capture FileMaker, tableau d’extraits de critiques de presse, nouvelle route dédiée et raccordement de l’onglet `Critiques de presse` depuis la fiche livre.
- 14:14 - Internationalisation complète des contenus métier de `/[locale]/books/details/back-cover` et `/[locale]/books/details/press-critiques`, avec déplacement des textes de quatrième de couverture et des extraits de presse dans `messages/*.json`, puis branchement des deux sous-pages sur ces traductions dans les six langues.
- 14:49 - Création de la sous-page `/[locale]/books/details/availability` pour l’écran de localisation, avec nouveau composant dédié, tableau des organismes de consultation inspiré de la maquette FileMaker, nouvelle route dédiée, raccordement de l’onglet `Disponibilité` et contenus localisés dans les six langues.
- 14:55 - Création de la sous-page `/[locale]/books/details/publishing` pour l’écran `Langues de parution`, avec nouveau composant dédié, panneau de synthèse des langues publiées, tableau des éditions et traductions inspiré de la maquette FileMaker, nouvelle route dédiée, raccordement de l’onglet `Parution` et contenus localisés dans les six langues.
- 16:37 - Renforcement du responsive haute priorité sur `/[locale]/definition` et le groupe `/[locale]/books/details*`, avec réorganisation mobile des fiches, suppression des hauteurs fixes sur petit écran, remplacement des tableaux denses par des cartes lisibles sur `back-cover`, `press-critiques`, `availability` et `publishing`, puis validation par `pnpm lint` et `pnpm build`.

# 24-06-2026

- 11:12 - Raccordement réel des groupes `/[locale]/persons` et `/[locale]/orgs` aux tables Supabase correspondantes, avec couche data typée, API routes durcies pour liste et détail, vraies listes paginées côté serveur, fiches détail alimentées par la base et nouveaux `loading.tsx` avec skeletons dédiés, puis validation par `pnpm lint` et `pnpm build`.
- 14:23 - Correction du mapping Supabase du fichier `persons` pour utiliser les vrais noms de colonnes importés en base, puis ajout d’un logger strictement serveur détaillant les appels API et les requêtes base avec paramètres, réponses brutes, statuts HTTP/PostgREST et erreurs complètes.
- 15:10 - Refonte visuelle majeure de `/[locale]/persons/details` pour densifier la fiche auteur, avec bloc central agrandi, onglets et champs rendus plus lisibles, biographie et bibliographie rééquilibrées, header renforcé et footer compacté afin de supprimer l’impression de vide sur desktop.

# 25-06-2026

- 10:47 - Reprise complète du responsive de `/[locale]/menu`, avec suppression des lignes forcées et du style inline restant, transformation du parcours mobile en cartes tactiles avec sous-menus visibles, assouplissement de la barre de recherche, rééquilibrage des espacements et des raccourcis bas, tout en conservant la composition interactive desktop.
- 10:47 - Alignement majeur du groupe `/[locale]/orgs` sur le standard désormais utilisé par `persons`, avec filtrage local des organismes non affichables, tri et compteurs cohérents issus de Supabase, recentrage exact de la liste `/[locale]/orgs`, reprise du header/fond/loading et refonte structurelle de `/[locale]/orgs/details` pour rapprocher la composition FileMaker de la fiche personnes.
- 14:54 - Normalisation finale du header mobile partagé STAVNET avec suppression du bloc titre/sous-titre hors badge sur petit écran, afin de n’afficher partout en mobile que le cartouche avec le nom de page et d’éliminer définitivement la duplication de `Littérature israélienne`.
- 15:20 - Durcissement responsive mobile des fiches `/[locale]/persons/details` et `/[locale]/orgs/details`, avec remplacement des onglets défilants et tronqués par une grille tactile lisible sur petit écran, puis revalidation visuelle dans le navigateur sur les parcours `persons` et `orgs`.
