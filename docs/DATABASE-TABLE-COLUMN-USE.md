# D1 — table `people`

Ce document décrit la structure relevée dans la copie locale de D1 le 28-07-2026. Les colonnes physiques de `people` sont distinctes des informations métier contenues dans la colonne JSON `payload`.

## Colonnes physiques

| Colonne | Type D1 | Affichée dans l’administration | Utilisation actuelle |
| --- | --- | --- | --- |
| `id` | `INTEGER` | Oui, dans les métadonnées | Identifiant stable de la fiche. |
| `name` | `TEXT` | Oui, comme libellé et titre de fiche | Nom normalisé pour les listes et les liens. |
| `payload` | `TEXT` | Oui, partiellement | JSON contenant les champs métier de la personne. Les clés scalaires listées ci-dessous sont rendues dans le formulaire. |
| `normalized_name` | `TEXT` | Non | Recherche et détection des doublons. |
| `created_at` | `TEXT` | Oui, dans les métadonnées | Date de création. |
| `updated_at` | `TEXT` | Oui, dans les métadonnées | Date de dernière modification. |
| `archived_at` | `TEXT` nullable | Non, indirectement | Gestion de la corbeille et de l’état archivé. |
| `version` | `INTEGER` | Oui, dans les métadonnées | Contrôle de concurrence lors de l’enregistrement. |
| `image_key` | `TEXT` nullable | Oui, via l’aperçu image | Référence de l’image Vercel Blob. |
| `created_by` | `TEXT` | Non | Auteur technique de la création. |
| `updated_by` | `TEXT` | Non | Auteur technique de la dernière mise à jour. |
| `archived_by` | `TEXT` nullable | Non | Auteur technique de l’archivage. |
| `image_original_name` | `TEXT` nullable | Non | Nom d’origine du fichier média. |
| `image_content_type` | `TEXT` nullable | Non | Type MIME du média. |
| `image_updated_at` | `TEXT` nullable | Non | Date de mise à jour du média. |

## Clés métier rendues depuis `payload`

Toutes les clés scalaires suivantes, relevées dans D1 local, sont affichées et modifiables dans la fiche personne. Elles ne sont pas des colonnes SQL séparées.

- `Activite Professionnelle`
- `Activité Professionnelle`
- `Année Publication`
- `Auteur Original`
- `Biographie`
- `Code Langue`
- `Cote Livre`
- `Date de Décès`
- `Date de Naissance`
- `Date Décès`
- `Date Naissance`
- `Langue Ecriture`
- `Langue Écriture`
- `Langue Traduction`
- `Lieu de Décès`
- `Lieu Résidence`
- `Nb. Contributions Auteurs`
- `Nb. Contributions Titres`
- `Nb. Fiches Base`
- `Nb. Fiches Trouvées`
- `Nb. Langues Traduction`
- `Nb. Pays Publication`
- `Nb. Prix Distinctions`
- `Nb. Rééditions Poche`
- `Nb. Rééditions Régulières`
- `Nb. Titres Originaux`
- `Nb. Titres Traduits`
- `Nom Prenom`
- `Nom Prénom`
- `Pays de Résidence`
- `Prénom Nom`
- `Si Date Décès`
- `Si Lieu Décès`
- `Titre`
- `Type`
- `Type Contribution`
- `Type Personne`
- `Ville de Naissance`

## Clés techniques de `payload`

| Clé | Affichée dans le formulaire | Utilisation |
| --- | --- | --- |
| `id` | Non | Référence de la fiche importée. |
| `dataQuality` | Non | Statut technique de qualité et d’archivage. |
| `Image. URL` | Non directement | Fallback historique de l’image ; l’aperçu privilégie `image_key`. |

Les futures clés scalaires ajoutées dans `payload` restent affichées automatiquement par l’administration, sauf si elles sont explicitement réservées aux métadonnées techniques.
