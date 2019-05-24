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
(36, 'Immigration maîtrisée, droit d\'asile effectif et intégration réussie','Immigration, droit d\'asile et intégration'),
(37, 'Restauration de Notre-Dame de Paris et institution d\'une souscription nationale','Restauration de Notre-Dame de Paris'),
(38, 'Droit voisin au profit des agences de presse et des éditeurs de presse','Profit des agences et des éditeurs de presse'),
(39, 'Accompagnement des jeunes majeurs vulnérables vers l\'autonomie','Accompagnement des jeunes majeurs vulnérables'),
(40, 'Protection des activités agricoles et cultures marines en zones littorale et de montagne','Protection des activités agricoles et cultures marines');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
