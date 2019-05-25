SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS `roletype` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `maleName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `femaleName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

INSERT IGNORE `roletype` (`id`, `maleName`, `femaleName`) VALUES
(1, 'Président', 'Présidente'),
(2, 'Co-Président', 'Co-Présidente'),
(3, 'Premier vice-président', 'Première vice-présidente'),
(4, 'Deuxième vice-président', 'Deuxième vice-présidente'),
(5, 'Vice-Président, co-rapporteur', 'Vice-Présidente, co-rapporteure'),
(6, 'Vice-Président', 'Vice-Présidente'),
(7, 'Questeur, membre', 'Questeure, membre'),
(8, 'Questeur', 'Questeure'),
(9, 'Rapporteur général', 'Rapporteure générale'),
(10, 'Rapporteur thématique', 'Rapporteure thématique'),
(11, 'Rapporteur', 'Rapporteure'),
(12, 'Co-rapporteur', 'Co-rapporteure'),
(13, 'Secrétaire', 'Secrétaire'),
(14, 'Président d\'âge', 'Présidente d\'âge'),
(15, 'Membre nommé', 'Membre nommée'),
(16, 'Membre de droit', 'Membre de droit'),
(17, 'Membre titulaire', 'Membre titulaire'),
(18, 'Membre suppléant', 'Membre suppléante'),
(19, 'Membre', 'Membre'),
(20, 'Secrétaire d\'âge', 'Secrétaire d\'âge');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
