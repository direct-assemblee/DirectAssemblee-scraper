SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS `instancetype` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `plural` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `singular` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

INSERT IGNORE `instancetype` (`id`, `plural`, `singular`) VALUES
(1, 'Bureau', 'Bureau'),
(2, 'Délégations du Bureau', 'Délégation du Bureau'),
(3, 'Commissions permanentes', 'Commission permanente'),
(4, 'Commissions (non permanentes)', 'Commission non permanente'),
(5, 'Délégations et Office', 'Délégation et Office'),
(6, 'Groupes d\'amitié', 'Groupe d\'amitié'),
(7, 'Groupes d\'études', 'Groupe d\'études'),
(8, 'Missions d\'information', 'Mission d\'information'),
(9, 'Pour une nouvelle Assemblée nationale - Groupes de travail', 'Pour une nouvelle Assemblée nationale - Groupe de travail');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
