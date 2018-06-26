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
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=107;

INSERT IGNORE `roletype` (`id`, `maleName`, `femaleName`) VALUES
(1, 'Président', 'Présidente'),
(2, 'Co-Président', 'Co-Présidente'),
(3, 'Vice-Président', 'Vice-Présidente'),
(4, 'Premier vice-président', 'Première vice-présidente'),
(5, 'Deuxième vice-président', 'Deuxième vice-présidente'),
(6, 'Secrétaire', 'Secrétaire'),
(7, 'Rapporteur', 'Rapporteure'),
(8, 'Co-rapporteur', 'Co-rapporteure'),
(9, 'Rapporteur général', 'Rapporteure générale'),
(10, 'Questeur', 'Questeure'),
(11, 'Membre', 'Membre'),
(12, 'Membre de droit', 'Membre de droit'),
(13, 'Membre nommé', 'Membre nommée'),
(14, 'Membre titulaire', 'Membre titulaire'),
(15, 'Membre suppléant', 'Membre suppléante');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
