SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS `ballottype` (
  `id` int(1) NOT NULL AUTO_INCREMENT,
  `displayName` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `officialPath` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

INSERT IGNORE `ballottype` (`id`, `displayName`, `name`, `officialPath`) VALUES
(1, 'Scrutin ordinaire', 'vote_ordinary', 'SOR'),
(2, 'Scrutin solennel', 'vote_solemn', 'SSO'),
(3, 'Motion de censure', 'vote_motion_of_censure', 'MOT'),
(4, 'Autre scrutin', 'vote_other', 'AUT'),
(5, 'Scrutin (type à venir)', 'vote_undefined', 'UND');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
