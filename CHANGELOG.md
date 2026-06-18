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
