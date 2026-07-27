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
- 15:29 - Ajout d’une recherche par nom sur les listes `/[locale]/persons` et `/[locale]/orgs`, avec filtre serveur sur les données Supabase déjà chargées, conservation du terme dans la pagination, états vides explicites et nouveaux libellés i18n dans les six langues.
- 15:41 - Passage de la recherche par nom des listes `/[locale]/persons` et `/[locale]/orgs` en mode dynamique, avec champ client auto-appliqué sans bouton de validation et réécriture instantanée de l’URL locale pour relancer le filtrage serveur.

# 26-06-2026

- 09:27 - Centralisation du pilotage visuel des composants partagés `StavnetHeader` et `StavnetFooter`, avec suppression des surcharges Tailwind injectées depuis les pages et écrans de chargement afin que leur mise en page soit désormais décidée directement par les composants source.
- 10:37 - Réalignement transversal du bloc titre partagé `StavnetHeader` sur une largeur centrée commune aux écrans STAVNET, afin d’aligner plus proprement `Littérature israélienne` et son sous-titre avec les conteneurs principaux affichés sous le header.
- 10:37 - Augmentation d’environ 10% de la hauteur utile des grands conteneurs de listes et de fiches sur les parcours `/[locale]/orgs*` et `/[locale]/persons*`, avec ajustement cohérent des skeletons et des tableaux détaillés pour offrir davantage d’espace vertical.
- 10:54 - Ajout d’un dossier `script` à la racine avec un utilitaire Python `eps_to_jpg.py` permettant de convertir en lot les fichiers `.eps` d’un dossier en `.jpg` directement dans ce même dossier.
- 15:04 - Stabilisation des parcours `/[locale]/persons*` et `/[locale]/orgs*` en hébreu et en arabe, avec verrouillage des shells et écrans de chargement en `ltr` pour préserver la composition FileMaker tout en conservant une saisie de recherche compatible RTL.

# 29-06-2026

- 11:56 - Recentrage géométrique du bloc titre desktop partagé `StavnetHeader`, avec suppression du décalage horizontal résiduel sur toutes les pages STAVNET et réalignement du contrôle droit associé pour que l’en-tête reste droit au-dessus des contenus.
- 12:02 - Mise en place de l’infrastructure Vercel du projet avec création du projet `stavnet-app`, liaison locale du dépôt via `.vercel` et connexion du repository GitHub `michel-DC/Stavnet` au projet Vercel.
- 12:12 - Finalisation du déploiement Vercel initial de `stavnet-app`, avec ajout des variables d’environnement Supabase sur les environnements `production`, `preview` et `development`, correction du typage `NextConfig` dans `next.config.ts` pour lever le blocage de build, puis publication de la première instance de production active.
- 12:55 - Reprise ciblée du responsive mobile des pages de garde `/(locale)` et `/(locale)/home`, avec recentrage vertical des contenus, justification du texte de présentation, modèle 3D réduit et recentré sur `/home`, et footer mobile recollé en bas sans rupture du style FileMaker existant.

# 30-06-2026

- 12:07 - Sécurisation du socle Supabase avec sauvegarde des tables `data-books`, `data-person` et `data-organism` dans `.codex-artifacts/supabase-backups/2026-06-30`, ajout d’identifiants techniques et d’index de recherche, création de la policy RLS manquante sur `data-books`, puis remplacement des lectures complètes locales par des RPC paginés et ciblés pour les parcours `persons` et `orgs`.
- 12:38 - Stabilisation du champ de recherche partagé des listes STAVNET en bloquant les réécritures d’URL au montage initial et les remplacements identiques, afin d’éliminer le rechargement infini observé sur les pages de données comme `/[locale]/persons`.
- 15:20 - Raccordement des fiches `/[locale]/persons/details` aux vraies images auteurs locales de `public/images/persons`, avec résolution automatique par nom normalisé et fallback visuel si aucune photo ne correspond.

# 01-07-2026

- 10:26 - Recalage visuel partagé des parcours `/[locale]/persons*` et `/[locale]/orgs*`, avec nouvel écart de sécurité entre pagination et footer desktop, harmonisation des écrans de chargement des organismes sur le standard des personnes et ajustement ciblé des grandes fiches détail pour mieux respecter la composition FileMaker.
- 10:49 - Conversion du lot de couvertures `public/images/books-cover` de `.eps` vers `.jpg` via les scripts Python du projet, puis nettoyage du dossier par suppression des sources `.eps` devenues inutiles.
- 11:38 - Reprise majeure du parcours `/[locale]/books` sur le standard `persons/orgs`, avec vraie lecture Supabase côté serveur, pagination et recherche par titre, nouvelle fiche détail alimentée par la base, états `loading` dédiés et skeletons FileMaker cohérents sur la liste et la fiche.
- 14:52 - Reprise des sous-pages `/[locale]/books/details/{back-cover,press-critiques,availability,publishing}` pour les brancher sur le livre sélectionné, harmoniser leur shell avec la fiche livre et supprimer les contenus statiques `sampleBook` au profit des vraies métadonnées et statistiques du détail.
- 14:59 - Branchement réel des onglets livres `Disponibilité` et `Parution` sur `data-books` avec calcul des localisations bibliographiques, enrichissement pays via `data-organism`, regroupement des éditions/traductions d’un même ouvrage et suppression du faux contenu statique pour `Critiques de presse` quand la base ne contient pas de source structurée.
- 15:20 - Mise en place d’une vraie couche de critiques de presse pour les livres, avec migration Supabase créant `book_press_reviews`, extraction idempotente des blocs `Presse :` depuis `data-books`, branchement du détail livre sur cette nouvelle table et ajustement du versionnement pour conserver les migrations `supabase/migrations`.

# 02-07-2026

- 10:09 - Recalage visuel transversal des écrans d’accueil et du parcours `books/details`, avec agrandissement et recentrage des blocs titres sur `/home` et `/menu`, abaissement du modèle 3D, réordonnancement du footer d’accueil, logo de header légèrement agrandi et décalé à gauche, onglets livres renforcés, footer recentré sous les fiches et repositionnement des repères verticaux droits.

# 03-07-2026

- 09:07 - Modification du champ de recherche partagé des listes `/[locale]/books`, `/[locale]/orgs` et `/[locale]/persons` pour déclencher le filtrage uniquement à la validation réelle de la saisie, via `blur`, touche `Entrée` ou réinitialisation explicite, sans délai automatique en millisecondes.
- 09:34 - Reprise structurelle des grands tableaux desktop de `/[locale]/books`, `/[locale]/orgs` et `/[locale]/persons`, avec remplacement des grilles séparées par de vraies tables à colonnes partagées afin d’aligner exactement les séparateurs verticaux entre en-têtes et lignes de valeurs.
- 09:56 - Ajout du domaine personnalisé `israeli-literature.com` au projet Vercel `stavnet-app`, avec rattachement du site à ce nouveau domaine apex et préparation de la configuration DNS externe requise pour la vérification.
- 10:00 - Ajout du sous-domaine public `www.israeli-literature.com` au projet Vercel `stavnet-app`, avec rattachement automatique au dernier déploiement de production et préparation de la cible DNS recommandée pour le provider externe.
- 10:22 - Mise en place d’un système partagé de métadonnées SEO multilingues pour tout le segment `src/app/[locale]`, avec titres et descriptions dédiés pour les pages d’accueil, de navigation, de recherche, de définition, de listes et de détails `books`, `persons` et `orgs`, y compris les sous-pages livres et les variantes dynamiques basées sur le contenu affiché.
- 09:57 - Mise en place de la navigation par données liées sur les parcours livres, avec nouvelle page générique `/[locale]/books/related`, RPC Supabase paginé par facette métier, valeurs soulignées et cliquables dans les fiches livres, puis fallback automatique vers les livres liés si une fiche personne ou organisme n’existe pas.
- 11:26 - Changement de l’ordre de la liste `/[locale]/books` pour afficher les ouvrages du plus récent au plus ancien selon `Année`, en conservant un tri secondaire stable par titre puis identifiant pour la pagination et la recherche.
- 11:34 - Renforcement du tri de `/[locale]/books` avec normalisation numérique des années côté serveur applicatif avant pagination, afin de garantir un ordre réellement décroissant même lorsque le champ `Année` contient des formats hétérogènes.
- 12:04 - Remplacement complet de la page d’accueil `/(locale)` par le visuel de `/(locale)/home`, avec mutualisation du composant entre `"/"` et `"/home"`, réintégration du texte historique de présentation de la base et ajustement du bouton `Suite` pour poursuivre vers le menu.
- 14:16 - Mise en place d’un workflow GitHub Actions de CI sur tous les `push` de branches, avec installation PNPM, cache Next.js et validation systématique par `pnpm lint` puis `pnpm build`.
- 14:39 - Mise en place du socle de tests de l’application avec `Vitest` pour la logique métier, `Playwright` pour les parcours navigateur, tests de bootstrap Supabase, couverture initiale des helpers, des flux livres/personnes/organisations et ajout des scripts de test dédiés.

# 09-07-2026

- 15:08 - Refonte des tableaux desktop des pages `/[locale]/books`, `/[locale]/persons` et `/[locale]/orgs` avec style plus compact, pagination allégée et affichage strict de 10 lignes par page.
- 15:08 - Mise en fonctionnement réelle de la page `/[locale]/search`, avec branchement du formulaire de recherche avancée vers la liste `/[locale]/books`, transmission des critères métier dans l’URL et exploitation du nouveau filtrage multi-champs côté serveur applicatif.

# 06-07-2026

- 10:23 - Harmonisation structurelle des fiches détail `/[locale]/books/details`, `/[locale]/persons/details` et `/[locale]/orgs/details` sur un gabarit desktop commun, avec largeur totale partagée, bloc principal à hauteur uniforme, colonnes latérales recalées et footers alignés sur le même cadre.
- 10:37 - Normalisation typographique transversale des fiches détail `books`, `persons` et `orgs` sur la référence `persons/details`, avec alignement des tailles de texte desktop, des graisses, des onglets, des intitulés latéraux, des champs de valeurs et des compteurs verticaux.
- 10:47 - Recalage visuel du header partagé STAVNET avec augmentation légère de la hauteur du cartouche central, resserrement de la composition desktop et réalignement du logo ainsi que du bloc titre droit autour d’une ligne d’ensemble plus cohérente.
- 11:11 - Extension du système d’interliens aux fiches `/[locale]/persons/details` et `/[locale]/orgs/details`, avec valeurs métier soulignées ouvrant les livres liés, résolution serveur exacte des titres bibliographiques vers `/books/details` avec fallback automatique vers la liste `/books`, et mutualisation du socle de liens déjà utilisé par la fiche livre.
- 12:07 - Ajout d’un filtrage par type sur la liste `/[locale]/orgs`, avec lien direct depuis le groupe d’appartenance des fiches organismes vers tous les organismes du même type, conservation de la pagination et compatibilité avec la recherche par nom à l’intérieur de ce filtre.
- 12:11 - Réalimentation des tableaux bibliographiques de `/[locale]/persons/details` et `/[locale]/orgs/details` à partir des tables source, avec reconstruction complète des ouvrages liés quand les RPC de détail ne remontent qu’une ligne incomplète, afin d’afficher réellement les livres attendus dans les deux fiches.
- 16:43 - Correction du fallback bibliographique des fiches personnes pour fusionner les lignes issues de `data-person` via `Auteur Original` et les ouvrages directs issus de `data-books`, afin que des autrices comme Ada Aharoni affichent enfin leurs titres originaux et traduits dans le tableau du bas.
- 16:47 - Correction de la reconstruction bibliographique des fiches personnes pour parcourir `data-books` et `data-person` par lots complets au lieu de dépendre de la limite implicite Supabase, ce qui rétablit l’affichage des ouvrages situés au-delà des premiers 1000 enregistrements, comme les titres originaux d’Ada Aharoni.
- 16:55 - Ajustement métier de la bibliographie des fiches personnes pour classer les ouvrages issus de `data-books` en `Original` ou `Traduction` selon la langue d’écriture de l’auteur, puis fusionner les doublons par œuvre afin de conserver les traductions distinctes attendues sans répéter les mêmes titres français déjà codés dans `data-person`.
- 17:02 - Durcissement équivalent du fallback des fiches organismes avec lecture complète de `data-books` et `data-organism` par lots Supabase, afin que les ouvrages publiés liés à des éditeurs comme `18-oct` ne disparaissent plus lorsqu’ils se trouvent au-delà de la limite implicite des premières pages de résultats.
- 17:53 - Recentrage exact de la composition desktop complète des fiches `/[locale]/books/details`, `/[locale]/persons/details` et `/[locale]/orgs/details`, avec nouveau cadre global incluant colonne gauche, bloc principal, repère vertical droit et footer pour que l’ensemble visible soit aligné au centre géométrique de la page.

# 07-07-2026

- 10:41 - Passage en rendu dynamique forcé des routes locales pilotées par query string (`/[locale]/persons/details`, `/[locale]/orgs/details`, `/[locale]/books/details*`, `/[locale]/books/related` et `/[locale]/books/by-title`) pour supprimer les 404 au chargement direct sur localhost malgré des segments et données valides.
- 10:48 - Activation des onglets `Titres originaux` et `Titres traduits` de `/[locale]/persons/details` avec affichage réel des ouvrages de l’auteur filtrés par type bibliographique, en desktop comme en mobile, au lieu des panneaux vides précédents.
- 10:50 - Mise en place et durcissement du socle CI et tests avec `Vitest`, `Playwright` et une base Supabase de test dédiée, correction du bootstrap Supabase pour éviter l’échec au build, puis validation complète du pipeline par lint, tests et build.
- 10:50 - Verrouillage de la branche `master` côté GitHub avec une protection exigeant le check CI `verify` avant acceptation des changements.
- 11:04 - Ajout d’un filtre de type sur la liste `/[locale]/orgs` avec trois entrées utilisateur `Editeurs`, `Bibliothèques` et `Autres organismes`, en tenant compte du fait que la base ne stocke en `Type` que `Editeur` et `AutreOrganisme`, les bibliothèques étant isolées comme sous-ensemble métier des autres organismes.
- 11:29 - Normalisation visuelle des principaux tableaux desktop encore montés en grilles CSS sur `books/details`, `books/details/*`, `orgs/details` et `definition`, avec conversion en vraies tables HTML à colonnes fixes pour rétablir des bordures continues et un alignement FileMaker cohérent.

# 09-07-2026

- 09:27 - Ajout d’une redirection automatique depuis `/[locale]/books/related` vers `/books/details` quand une facette liée ne retourne qu’un seul ouvrage, afin d’éviter l’étape intermédiaire de filtrage quand le résultat est déjà unique.
- 10:57 - Généralisation de la redirection directe vers la fiche unique sur les listes `/[locale]/books`, `/[locale]/persons` et `/[locale]/orgs`, avec bascule automatique vers `/books/details`, `/persons/details` ou `/orgs/details` dès qu’une recherche ou un filtre ne renvoie qu’un seul résultat.
- 09:54 - Mise à jour de la fiche personne avec extraction des codes de parution pour afficher séparément `Parution` et `Façonnage`, tri des bibliographies par type puis par année décroissante, et ajout d’un hook dédié pour normaliser les lignes avant affichage.
- 09:57 - Refactor de la couche Supabase en services cachés par domaine pour `books`, `persons` et `orgs`, avec cache Next explicite sur les lectures coûteuses, retrait des `force-dynamic` inutiles sur les routes de détail et correction du rechargement infini via un garde-fou sur la synchronisation de recherche.
- 10:33 - Ajout de traces `DEBUG_LOG_INFINITE_FETCH` sur les pages détail et dans le cache serveur pour compter les appels, détecter les doublons concurrents et réduire les hits Supabase répétés sur les parcours `persons` et `books`.
- 10:45 - Ajout de `error.tsx` sur les segments async `books`, `persons` et `orgs` concernés, avec écran d’erreur local et bouton de retry pour éviter les relances de chargement sans retour visuel quand le rendu plante.

# 10-07-2026

- 09:49 - Durcissement des fiches détail `persons`, `books` et `orgs` avec nouveau routeur de secours pour les URLs directes, résolution plus tolérante des noms côté serveur, logs de diagnostic renforcés et revalidation du parcours `persons/details` sur plusieurs auteurs en navigateur.
- 11:52 - Recalage du modèle 3D d’accueil avec portraits d’auteurs projetés en vitrines sur les panneaux extérieurs détectés du mesh GLB via `DecalGeometry`, analyse des triangles verticaux, regroupement par plans extérieurs, espacement anti-superposition des slots et logs détaillant dimensions, position, normale et surface des faces.
- 14:09 - Répartition des portraits du modèle 3D d’accueil en une vitrine par panneau extérieur détecté, avec dimensionnement propre à chaque face pour éviter les superpositions et couverture élargie au-delà de la limite précédente de neuf images.
- 14:23 - Renforcement de l’analyse géométrique du modèle 3D d’accueil avec mesure des faces par sommets en repère local, centrage strict des vitrines dans une zone utile avec marges et logs détaillant dimensions globales, meshes, panneaux extérieurs, axes, bornes et placements.
- 14:30 - Ajustement de la détection des vitrines du modèle 3D d’accueil sur le contour extérieur réel de l’étoile de David, avec rejet des faces trop petites pour respecter les marges internes et logs des panneaux utilisables ou écartés.

# 11-07-2026

- 21:35 - Réduction de la consommation serveur en production avec désactivation des logs applicatifs hors développement, cache mémoire limité au développement, pagination bornée et lecture paginée des livres via une fonction Supabase dédiée.

# 14-07-2026

- 10:47 - Refonte visuelle du dashboard `/admin` sur une composition shadcn/ui pleine largeur, avec sidebar native, cartes de synthèse, tableau des auteurs sélectionnés et dialog de sélection limité à 12 portraits.

# 15-07-2026

- 09:20 - Ajout d’un tooltip shadcn/ui au survol des portraits d’auteurs sur le modèle 3D d’accueil, avec affichage du nom détecté par raycast directement au-dessus de l’image visée.
- 09:34 - Déplacement du texte de présentation de la page d’accueil dans un bloc encadré sous le logo de l’aside gauche, avec retrait de son affichage desktop sous le modèle 3D.
- 10:05 - Recalage global du header partagé STAVNET sur toutes les pages pour aligner le bloc titre desktop avec une marge droite symétrique à la marge gauche du logo, en supprimant aussi les surcharges locales qui cassaient cet équilibre.
- 10:18 - Correction du responsive desktop de la fiche auteur pour borner la hauteur du panneau principal selon l’espace disponible entre header et footer, avec scroll interne afin d’éviter que le footer recouvre les tableaux sur les écrans fixes.
- 11:18 - Renforcement de l’écart desktop entre les contenus STAVNET et le footer sur les fiches, listes, menu, recherche et écrans liés, avec hauteurs de panneaux bornées et scroll interne pour préserver la lecture sur grands écrans.
- 14:40 - Création de la page `/statistics` reproduisant l’écran FileMaker des graphes et données statistiques, avec blocs d’options, listes de pays/langues, période de visualisation, navigation STAVNET et traductions multilingues.

# 16-07-2026

- 09:50 - Refonte partagée des écrans d’erreur des fiches STAVNET avec composition responsive, hiérarchie visuelle renforcée et actions `Réessayer` / retour construites sur les composants shadcn/ui.
- 09:55 - Internationalisation des écrans d’erreur de fiches et d’ouvrages liés dans les six langues de l’application, avec messages, actions de réessai et liens de retour adaptés à chaque locale.
- 10:20 - Rééquilibrage vertical de la fiche personne pour rendre la bibliographie directement lisible sur desktop, avec compaction des champs d’identité, biographie défilante et tableau d’ouvrages densifié sans régression mobile.
- 10:43 - Refonte du gabarit partagé des pages secondaires d’ouvrages: quatrième de couverture, critiques de presse, disponibilité et parution disposent d’une largeur desktop harmonisée, d’une fiche supérieure plus compacte et de zones de contenu extensibles avec défilement adapté.
- 10:52 - Correction des intitulés du cartouche central du header dans les six langues: chaque écran de recherche, liste, fiche et définition affiche désormais son titre fonctionnel au lieu du message de bienvenue.
- 11:46 - Refonte visuelle de la page `/statistics` avec une hiérarchie d’analyse plus lisible, des blocs de critères et listes harmonisés, une action de validation priorisée et un comportement responsive sans débordement horizontal.
- 11:56 - Activation des filtres de la page `/statistics` avec de véritables cases à cocher shadcn/ui pour les critères, langues et pays, accompagnées d’états sélectionnés visibles et accessibles.
- 12:09 - Correction de la navigation des auteurs : les portraits de la vitrine ouvrent la fiche personne correspondante, dont Michel Bar-Zohar, et une fiche personne introuvable ne redirige plus vers une liste de livres.
- 12:14 - Ajout des variantes nominatives de portraits pour diriger Ben-Ner Yitzhak vers la fiche existante d’Itzhak Ben-Ner, sans générer de 404.
- 12:19 - Réutilisation des portraits de la vitrine 3D sur les fiches personnes malgré les variantes de nom, afin que Michel Bar-Zohar et Itzhak Ben-Ner affichent leur image réelle au lieu du placeholder.
- 12:29 - Refonte partagée des listes `/books`, `/persons` et `/orgs` avec `Card`, `Table`, `Button`, `Input` et pagination shadcn/ui, en préservant les liens de détail, la recherche serveur et les vues mobiles sans débordement.
- 15:58 - Refonte responsive desktop transversale des écrans STAVNET : gabarits compacts pour 1366×768, listes et tableaux à défilement local, fiches personnes/organismes/livres et sous-fiches livres contenues entre header et footer, onglets et marges partagées bornés, puis validation visuelle de 18 routes sans débordement horizontal.

# 17-07-2026

- 11:05 - Migration majeure de la couche de données Supabase vers Cloudflare D1 : création des bases production et tests, Worker privé authentifié, import idempotent des CSV sources (livres, personnes, organismes et bibliographies), adaptation des contrats applicatifs et des tests d’intégration D1, puis validation par build Next.js.
- 12:12 - Stabilisation des parcours D1 `books`, `persons` et `orgs` : tableaux desktop à hauteur visible, projections Worker limitées aux colonnes demandées et fiches organismes enrichies avec leurs titres publiés.
- 12:30 - Correction du parcours D1 des ouvrages liés : filtres SQLite compatibles avec les clés CSV, endpoint dédié à toutes les facettes et validation locale des listes, fiches et sous-pages `books`, `persons` et `orgs`.
- 15:45 - Optimisation structurelle de D1 : facettes, éditeurs et titres d’œuvre indexés à l’import, compteurs matérialisés, listes paginées côté SQL et environnement local séparé de la production.
- 16:27 - Correction du proxy i18n pour intercepter aussi les routes non localisées, afin que `/books` et ses sous-pages soient redirigées vers leur variante avec locale au lieu de renvoyer une 404.

# 20-07-2026

- 09:38 - Réduction majeure des lectures D1 en remplaçant les scans complets des tables livres, personnes et organismes par des requêtes Worker ciblées, indexées et paginées pour les fiches personnes et les filtres d’organismes, puis déploiement en production du Worker et de l’application.
- 09:57 - Optimisation des listes de livres D1 : pagination fixée à dix résultats, projection SQL dédiée et indexée évitant la lecture et le décodage du JSON complet des livres, avec import CSV maintenu compatible et déploiement production/tests.
- 11:27 - Correction des interliens de fiches : les types et langues d’auteurs ou contributeurs ouvrent désormais la liste filtrée des personnes, les pays d’éditeurs la liste filtrée des organismes, avec nouveaux index D1 de test et URLs de footer conservant l’identifiant de l’ouvrage.
- 12:22 - Fiabilisation des facettes d’ouvrages D1 : les compteurs et pages liées excluent les fiches sans titre affichable, tandis que la normalisation d’encodage préserve les langues valides comme `Néerlandais`, rétablissant les résultats Prose et langues de traduction.
- 12:46 - Sécurisation des filtres croisés des fiches livres : les liens vers personnes et organismes conservent leur facette d’origine et reviennent automatiquement vers les ouvrages liés lorsqu’aucune entité correspondante n’existe, avec validation locale des cas `Auteur`, `Illustrateur` et `Albanie`.
- 13:52 - Correction de la recherche de titres D1 avec index trigramme couvrant les titres originaux, anglais et transcrits, et renforcement de la résolution des noms de personnes inversés ou composés afin de rétablir les parcours `Sarah` et `Bialik Haïm Nahman`.
- 14:31 - Réparation des relations bibliographiques D1 des 55 ouvrages ajoutés après l’import initial : leurs auteurs sont de nouveau indexés, dont les trois fiches `Sarah` de Mickaël Parienté.
- 14:49 - Remplacement majeur de la sélection du modèle 3D d’accueil par les onze portraits fournis, exclusion de la photo défaillante de Haïm Beer et désactivation des liens pour les auteurs sans fiche personne D1.
- 15:26 - Réintégration des onze portraits importés dans le catalogue partagé `public/images/persons`, afin que l’administration puisse sélectionner l’ensemble des soixante-dix auteurs disponibles.

# 21-07-2026

- 09:27 - Correction des fiches personnes ajoutées : la langue d’écriture est désormais lue depuis son libellé, y compris lorsque la clé CSV est encodée de façon historique, au lieu d’afficher le code technique `L`.
- 09:55 - Correction de la récupération des bibliographies des fiches personnes pour associer aussi les variantes orthographiques de prénoms, comme `Abraham` et `Avraham` Yehoshua, sans mélanger les homonymes.
- 10:07 - Correction des compteurs de bibliographie des fiches personnes : titres originaux, traductions et langues de publication sont désormais calculés depuis les ouvrages réellement affichés.
- 14:54 - Remplacement des onglets Statistiques des fiches livres, personnes et organismes par un tableau de bord interactif Recharts/shadcn-ui, avec séries temporelles, répartitions métier, sélecteurs Année/Décennie/Mois, états de données insuffisantes et traductions RTL dans les six locales.
- 15:50 - Raccordement des portraits de l’étoile aux fiches auteurs D1 avec gestion des variantes de noms, et remplacement de Hameiri Israel par Aharon Appelfeld dans la sélection affichée.

# 22-07-2026

- 11:18 - Enrichissement de la base D1 de production avec les neuf colonnes complémentaires des CSV livres, ajout des sept notices manquantes, correction des deux années `20222` et synchronisation des projections ainsi que des compteurs de livres.
- 11:24 - Classement des bibliographies personnes à partir de `CodePublication` (`O` original, `T` traduction, original par défaut), total calculé comme leur somme, et ajout de l’hébreu comme langue d’écriture d’Aharon Appelfeld.
- 11:38 - Consolidation des fiches personnes D1 : 491 doublons sont archivés sans suppression, 699 fiches canoniques restent publiques, les snapshots des variantes sont préservés dans les payloads et le Worker exclut désormais les archives des listes et détails.
- 12:12 - Consolidation des organismes D1 : correction traçable des encodages et des trois éditeurs contaminés par un saut de ligne, archivage de neuf variantes validées, prise en charge des alias et recalcul des compteurs publics depuis les relations livres.

# 23-07-2026

- 12:34 - Ajout d’un environnement D1/SQLite local cloné depuis `stavnet-production` : export des tables applicatives, reconstruction des index FTS5 via Docker et nouvelles commandes de synchronisation, d’inspection et de développement local.
- 12:55 - Correction de l’environnement `dev:local-db` : Next.js reçoit désormais le secret de `cloudflare/.dev.vars` utilisé par le Worker local, rétablissant les listes D1 locales et les routes après redémarrage.
- 14:00 - Mise en place du socle CRUD administrateur D1 : routes protégées pour les livres, personnes et organisations, listes et fiches d’édition dédiées, corbeille, journal d’audit et migration de métadonnées d’archivage.
- 14:28 - Fiabilisation de `dev:local-db` : contrôle du port 3000 avant de lancer Wrangler et arrêt attendu des sous-processus, évitant tout Worker local orphelin lors d’un conflit de port.
- 14:58 - Les formulaires de création administratifs chargent désormais tous les champs effectivement présents dans D1 pour les livres, personnes et organisations, afin de permettre une saisie complète dès la première fiche.
- 15:03 - Unification du shell administrateur : les listes, fiches, créations, recherche, corbeille et historique utilisent maintenant la même sidebar repliable, le même header et les mêmes actions de navigation que le dashboard `/admin`.
- 15:20 - Remplacement du stockage média Cloudflare R2 par le Blob Store public Vercel `stavnet-media`, avec téléversement admin protégé, références persistées dans D1 et configuration d’images distantes Next.js.
- 16:10 - Refonte ergonomique du parcours administrateur : écran de connexion plus lisible, navigation élargie, listes aérées, cibles d’action agrandies et hiérarchie typographique renforcée pour une consultation confortable.
- 16:11 - Enrichissement des outils administratifs : filtres serveur sur les listes, miniatures cohérentes pour les trois types de fiches, journal d’audit filtrable/paginé, création contextuelle d’une personne ou d’un organisme depuis un livre et invalidation des pages publiques après mutation.

# 24-07-2026

- 09:21 - Refonte des filtres administratifs en groupes de choix rapides shadcn, fondés sur les valeurs réelles de D1 et dotés d’états accessibles ainsi que d’une réinitialisation explicite.
- 09:32 - Ajustement de la barre de filtres Livres sur une ligne unique : Langue, Genre et Thème remplacent le filtre Année, avec les thèmes D1 exploitables et toast de confirmation vérifié.
- 10:04 - Identification versionnée des 21 anthologies comme ouvrages collectifs dans D1 local et production, avec ajout d’un sélecteur Oui/Non dédié dans l’éditeur administrateur des livres.
- 10:26 - Création de la page Table des matières des fiches livres, réservée aux ouvrages collectifs et construite sur la fiche secondaire avec les métadonnées bibliographiques et une grille prête à recevoir les entrées documentées.
- 10:53 - Optimisation des statistiques organismes D1 : suppression du calcul auteur N+1, regroupement des compteurs par page et index dédié aux facettes auteurs par livre.
- 11:10 - Tri alphabétique stable A→Z des listes administratives de livres, personnes et organisations, y compris après recherche, filtre ou changement de page.
- 11:14 - Ajout de miniatures médias dans les résultats de recherche globale administrateur, pour identifier plus rapidement les livres, personnes et organisations disposant d’une image.
- 11:31 - Ajout d’un filtre auteur textuel dans la liste administrative des livres, combinable aux filtres de langue, genre et thème sur l’ensemble de la pagination.
- 11:45 - Refonte des pages de création administratives : tous les champs D1 des livres, personnes et organisations sont désormais structurés par familles d’informations dans des groupes de champs lisibles.
- 11:51 - Uniformisation des fiches administratives d’édition avec les formulaires de création : sections par famille, séparateurs sobres et suppression des cartes imbriquées pour alléger la lecture.
- 14:15 - Fiabilisation de `dev:local-db` : attente authentifiée du Worker local sur le port 8787 avant le démarrage de Next.js, supprimant les erreurs de connexion de la configuration Étoile au lancement.

# 27-07-2026

- 09:57 - Importation versionnée des métadonnées et entrées de tables des matières dans D1 local et production, avec migration relationnelle, import UTF-8 idempotent, RPC Worker et affichage des entrées réelles sur les fiches d’ouvrages collectifs.
