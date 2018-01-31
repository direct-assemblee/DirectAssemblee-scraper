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
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=107;

INSERT IGNORE `shorttheme` (`id`, `fullName`, `shortName`) VALUES
(1, 'Ordonnances prises sur le fondement de la loi sur le renforcement du dialogue social', 'Ordonnances : renforcement du dialogue social'),
(2, 'Fin de la recherche et de l\'exploitation des hydrocarbures', 'Recherche et exploitation des hydrocarbures'),
(3, '« eau » et « assainissement », compétences optionnelles des communautés de communes', '« eau / assainissement », communautés de communes'),
(4, 'Prorogation de l\'application de la loi sur l\'état d\'urgence', 'Maintien de la loi sur l\'état d\'urgence'),
(5, 'Gestion des milieux aquatiques et prévention des inondations', 'Milieux aquatiques / prévention des inondations'),
(6, 'Protocole annexe à la convention avec l\'Algérie sur la sécurité sociale', 'Convention avec l\'Algérie sur la sécurité sociale'),
(7, 'Accord de partenariat et de coopération entre l\'UE et le Kazakhstan', 'Partenariat et coopération UE / Kazakhstan'),
(8, 'Transfert des compétences eau et assainissement aux communautés de communes', '« eau / assainissement », communautés de communes');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
