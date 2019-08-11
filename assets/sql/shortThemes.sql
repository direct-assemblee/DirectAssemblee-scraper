SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS `shorttheme` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `shortName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

INSERT IGNORE `shorttheme` (`id`, `fullName`, `shortName`) VALUES
(1, 'Ordonnances prises sur le fondement de la loi sur le renforcement du dialogue social', 'Ordonnances : renforcement du dialogue social'),
(2, 'Fin de la recherche et de l\'exploitation des hydrocarbures', 'Recherche et exploitation des hydrocarbures'),
(3, '« eau » et « assainissement », compétences optionnelles des communautés de communes', '« eau / assainissement », communautés de communes'),
(4, 'Prorogation de l\'application de la loi sur l\'état d\'urgence', 'Maintien de la loi sur l\'état d\'urgence'),
(5, 'Gestion des milieux aquatiques et prévention des inondations', 'Milieux aquatiques / prévention des inondations'),
(6, 'Protocole annexe à la convention avec l\'Algérie sur la sécurité sociale', 'Convention avec l\'Algérie sur la sécurité sociale'),
(7, 'Accord de partenariat et de coopération entre l\'UE et le Kazakhstan', 'Partenariat et coopération UE / Kazakhstan'),
(8, 'Transfert des compétences eau et assainissement aux communautés de communes', '« eau / assainissement », communautés de communes'),
(9, 'Importance de la ratification du CETA par voie référendaire', 'Affaire étrangères : CETA'),
(10, 'Reconnaissance de l\'épuisement professionnel comme maladie', 'Maladies professionnelles'),
(11, 'Adaptation au droit de l\'UE dans le domaine de la sécurité', 'Sécurité : droit de l\'UE'),
(12, 'Euthanasie et suicide assisté, pour une fin de vie digne', 'Fin de vie'),
(13, 'Mise en place d\'un récépissé dans le cadre d\'un contrôle d\'identité', 'Récépissé pour les contrôles d\'identité'),
(14, 'Accord de transport aérien avec les USA, l\'Islande et la Norvège', 'Accord de transport aérien'),
(15, 'Consultation sur l\'accession à la pleine souveraineté de la Nouvelle-Calédonie', 'Souveraineté de la Nouvelle-Calédonie'),
(16, 'Protection des savoir-faire et des informations commerciales non divulgués', 'Secret des affaires'),
(17, 'Encadrement du régime d\'ouverture des établissements privés hors contrat', 'Régime des établissements privés hors contrat'),
(18, 'Accueil des gens du voyage et lutte contre les installations illicites', 'Gens du voyage'),
(19, 'Attribution de la carte du combattant aux soldats engagés en Algérie après les accords d\'Evian', 'Soldats engagés en Algérie / accords d\'Evian'),
(20, 'Augmentation du pouvoir d\'achat grâce à la création d\'un ticket-carburant', 'Augmentation du pouvoir d\'achat'),
(21, 'Exonération fiscale et sociale des heures supplémentaires', 'Exonération fiscale et sociale des heures supplémentaires'),
(22, 'Suppression de la prise en compte des revenus du conjoint dans la base de calcul de l\'allocation aux adultes handicapés', 'Calcul de l\'allocation aux adultes handicapés'),
(23, 'Droit voisin au profit des éditeurs de services de presse en ligne', "Presse en ligne"),
(24, 'Équilibre des relations commerciales dans le secteur agro-alimentaire', 'Agro-alimentaire : relations commerciales'),
(25, 'Évolution du logement, de l’aménagement et du numérique (ELAN)', 'Logement, aménagement et numérique'),
(26, 'Accidents du travail et maladies professionne', 'Accidents du travail et maladies professionnelles'),
(27, 'Encadrement de l\'utilisation du téléphone portable dans les écoles et collèges', 'Utilisation du téléphone portable à l\'école et au collège'),
(28, 'Mise des aspirations du peuple au cœur des débats budgétaires', 'Aspirations du peuple au cœur des débats budgétaires'),
(29, 'Adaptation des vitesses maximales autorisées par la police de la circulation', 'Vitesses maximales de circulation autorisées'),
(30, 'Renforcement des outils et des moyens de pilotage de la recherche publique', 'Outils et moyens de pilotage de la recherche publique'),
(31, 'Renforcement des droits des consommateurs en matière de démarchage téléphonique', 'Démarchage téléphonique : droits des consommateurs'),
(32, 'Pour une démocratie plus représentative, responsable et efficace', 'Démocratie plus représentative, responsable et efficace'),
(33, 'Utilisation des caméras mobiles par les autorités de sécurité publique', 'Utilisation des caméras pour la sécurité publique'),
(34, 'Protocole contre la fabrication et le trafic illicites d\'armes à feu', 'Fabrication et le trafic illicites d\'armes à feu'),
(35, 'Accord de coopération entre l\'Union européenne et la Nouvelle-Zélande', 'Accord entre l\'UE et la Nouvelle-Zélande'),
(36, 'Immigration maîtrisée, droit d\'asile effectif et intégration réussie', 'Immigration, droit d\'asile et intégration'),
(37, 'Restauration de Notre-Dame de Paris et institution d\'une souscription nationale', 'Restauration de Notre-Dame de Paris'),
(38, 'Droit voisin au profit des agences de presse et des éditeurs de presse', 'Profit des agences et des éditeurs de presse'),
(39, 'Accompagnement des jeunes majeurs vulnérables vers l\'autonomie', 'Accompagnement des jeunes majeurs vulnérables'),
(40, 'Protection des activités agricoles et cultures marines en zones littorale et de montagne', 'Protection des activités agricoles et cultures marines'),
(41, 'CETA : Accord économique et commercial global et accord de partenariat stratégique entre l\'UE et le Canada', 'CETA : Accord économique et commercial global entre l\'UE et le Canada'),
(42, 'Droit voisin au profit des agences et éditeurs de presse', 'Droit voisin au profit de la presse'),
(43, 'Compétences de la prévôté sur le territoire de la République de Djibouti', 'Prévôté sur le territoire de la République de Djibouti'),
(44, 'Taxe sur les services numériques et impôt sur les sociétés', 'Taxe et impôt sur les services numériques'),
(45, 'Droit de résiliation sans frais de contrats de complémentaire santé', 'Résiliation de contrats de complémentaire santé'),
(46, 'Amélioration des modalités de contrôle budgétaire par le Parlement', 'Modalités de contrôle budgétaire par le Parlement'),
(47, 'Évaluation des dépenses fiscales par les administrations publiques', 'Évaluation des dépenses fiscales par les administrations publiques'),
(48, 'Lutte contre la fraude et l\'évasion fiscales, priorité nationale 2020', 'Lutte contre la fraude et l\'évasion fiscales'),
(49, 'Effort en faveur d’une politique ambitieuse d’engagement citoyen', 'Effort en faveur d’une politique d’engagement citoyen'),
(50, 'Rationalisation des agences publiques et des instances consultatives nationales', 'Rationalisation des agences publiques'),
(51, 'Accord-cadre de coopération sanitaire avec la Suisse et le Luxembourg', 'Coopération sanitaire avec la Suisse et le Luxembourg'),
(52, 'Accord de coopération avec la Belgique sur la mobilité terrestre', 'Coopération avec la Belgique sur la mobilité terrestre'),
(53, 'Sécurité nationale et exploitation des réseaux radioélectriques mobiles', 'Sécurité nationale et exploitation des réseaux mobiles'),
(54, 'Convention n° 184 de l\'OIT relative à la sécurité et à la santé dans l’agriculture', 'Sécurité et à la santé dans l’agriculture'),
(55, 'Conseils d\'administration des services départementaux d\'incendie et de secours', 'Services départementaux d\'incendie et de secours'),
(56, 'Agenda commercial européen et partenariat économique entre l’Union européenne et le Japon', 'Commerce et partenariat économique entre l\'UE et le Japon'),
(57, 'Délai d\'intervention du juge en cas de rétention administrative à Mayotte', 'Délai d\'intervention du juge à Mayotte'),
(58, 'Mesures de préparation au retrait du Royaume-Uni de l\'Union européenne', 'Mesures de préparation au retrait du Royaume-Uni de l\'UE'),
(59, 'Fonds spécifique destiné à la recherche oncologique pédiatrique', 'Recherche oncologique pédiatrique'),
(60, 'Encadrement du démarchage téléphonique et lutte contre les appels frauduleux', 'Démarchage téléphonique et appels frauduleux'),
(61, 'Evolution du logement, de l’aménagement et du numérique (ELAN)', 'Evolution du logement, de l\’aménagement et du numérique (ELAN)'),
(62, 'Equilibre des relations commerciales dans le secteur agro-alimentaire (EGALIM)', 'Eelations commerciales dans le secteur agro-alimentaire'),
(63, 'Droits des consommateurs en matière de démarchage téléphonique', 'Droits des consommateurs - démarchage téléphonique'),
(64, 'Physicien médical et qualifications professionnelles dans le domaine de la santé', 'Qualifications professionnelles dans le domaine de la santé'),
(65, 'Prorogation de l\'application de la loi sur l\'état d\'urgence (2)', 'Loi sur l\'état d\'urgence'),
(66, 'Accession à la pleine souveraineté de la Nouvelle-Calédonie', 'Pleine souveraineté de la Nouvelle-Calédonie')
;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
