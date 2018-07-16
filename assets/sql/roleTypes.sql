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
(3, 'Premier vice-président', 'Première vice-présidente'),
(4, 'Deuxième vice-président', 'Deuxième vice-présidente'),
(5, 'Vice-Président', 'Vice-Présidente'),
(6, 'Questeur', 'Questeure'),
(7, 'Rapporteur général', 'Rapporteure générale'),
(8, 'Rapporteur', 'Rapporteure'),
(9, 'Co-rapporteur', 'Co-rapporteure'),
(10, 'Secrétaire', 'Secrétaire'),
(11, 'Président d\'âge', 'Présidente d\'âge'),
(12, 'Membre nommé', 'Membre nommée'),
(13, 'Membre de droit', 'Membre de droit'),
(14, 'Membre titulaire', 'Membre titulaire'),
(15, 'Membre suppléant', 'Membre suppléante'),
(16, 'Membre', 'Membre');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
