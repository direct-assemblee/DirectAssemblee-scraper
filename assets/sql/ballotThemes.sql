SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS theme (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `typeName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=107;

INSERT IGNORE `theme` (`id`, `name`, `typeName`) VALUES
(1, 'Affaires étrangères', 'AFFAIRES_ETRANGERES'),
(2, 'Agriculture', 'AGRICULTURE'),
(3, 'Aménagement du territoire', 'AMENAGEMENT_TERRITOIRE'),
(4, 'Anciens combattants', 'ANCIENS_COMBATTANTS'),
(5, 'Budget', 'BUDGET'),
(6, 'Collectivités territoriales', 'COLLECTIVITES_TERRITORIALES'),
(7, 'Culture', 'CULTURE'),
(8, 'Défense', 'DEFENSE'),
(9, 'Economie et finances, fiscalité', 'ECONOMIE_FINANCE_FISCALITE'),
(10, 'Education', 'EDUCATION'),
(11, 'Energie', 'ENERGIE'),
(12, 'Entreprises', 'ENTREPRISES'),
(13, 'Environnement', 'ENVIRONNEMENT'),
(14, 'Famille', 'FAMILLE'),
(15, 'Fonction publique', 'FONCTION_PUBLIQUE'),
(16, 'Justice', 'JUSTICE'),
(17, 'Logement et urbanisme', 'LOGEMENT_URBANISME'),
(18, 'Outre-mer', 'OUTRE_MER'),
(19, 'PME, commerce et artisanat', 'PME_COMMERCE_ARTISANAT'),
(20, 'Police et sécurité', 'POLICE_SECURITE'),
(21, 'Pouvoirs publics et Constitution', 'POUVOIRS_PUBLICS_CONSTITUTION'),
(22, 'Questions sociales et santé', 'QUESTIONS_SOCIALES_SANTE'),
(23, 'Recherche, sciences et techniques', 'RECHERCHE_SCIENCES_TECHNIQUES'),
(24, 'Sécurité sociale', 'SECURITE_SOCIALE'),
(25, 'Société', 'SOCIETE'),
(26, 'Sports', 'SPORTS'),
(27, 'Traités et conventions', 'TRAITES_CONVENTIONS'),
(28, 'Transports', 'TRANSPORTS'),
(29, 'Travail', 'TRAVAIL'),
(30, 'Union européenne', 'UNION_EUROPEENNE');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
