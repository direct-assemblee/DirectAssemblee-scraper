# ************************************************************
# Sequel Pro SQL dump
# Version 4541
#
# http://www.sequelpro.com/
# https://github.com/sequelpro/sequelpro
#
# Hôte: 127.0.0.1 (MySQL 5.7.22)
# Base de données: directassemblee
# Temps de génération: 2018-06-26 18:55:35 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Affichage de la table ballot
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ballot` (
  `createdAt` varchar(255) DEFAULT NULL,
  `updatedAt` varchar(255) DEFAULT NULL,
  `officialId` int(11) NOT NULL,
  `title` longtext,
  `originalThemeName` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `dateDetailed` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `totalVotes` double DEFAULT NULL,
  `yesVotes` double DEFAULT NULL,
  `noVotes` double DEFAULT NULL,
  `nonVoting` double DEFAULT NULL,
  `isAdopted` tinyint(1) DEFAULT NULL,
  `analysisUrl` varchar(255) DEFAULT NULL,
  `fileUrl` varchar(255) DEFAULT NULL,
  `themeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`officialId`),
  UNIQUE KEY `officialId` (`officialId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table declaration
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `declaration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `deputyId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table department
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `nameUppercase` varchar(255) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `soundexName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table deputy
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deputy` (
  `createdAt` varchar(255) DEFAULT NULL,
  `updatedAt` varchar(255) DEFAULT NULL,
  `officialId` int(11) NOT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `birthDate` varchar(255) DEFAULT NULL,
  `parliamentGroup` varchar(255) DEFAULT NULL,
  `departmentId` double DEFAULT NULL,
  `district` double DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `job` varchar(255) DEFAULT NULL,
  `currentMandateStartDate` varchar(255) DEFAULT NULL,
  `mandateEndDate` varchar(255) DEFAULT NULL,
  `mandateEndReason` varchar(255) DEFAULT NULL,
  `seatNumber` double DEFAULT NULL,
  `activityRate` double DEFAULT '0',
  PRIMARY KEY (`officialId`),
  UNIQUE KEY `officialId` (`officialId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table deputy_subscribers__subscriber_followedDeputiesIds
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deputy_subscribers__subscriber_followedDeputiesIds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deputy_subscribers` int(11) DEFAULT NULL,
  `subscriber_followedDeputiesIds` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table deputy_workCreations__work_authors
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deputy_workCreations__work_authors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deputy_workCreations` int(11) DEFAULT NULL,
  `work_authors` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table deputy_workParticipations__work_participants
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `deputy_workParticipations__work_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deputy_workParticipations` int(11) DEFAULT NULL,
  `work_participants` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table extrainfo
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `extrainfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `info` varchar(255) DEFAULT NULL,
  `value` longtext,
  `workId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table extraposition
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `extraposition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `position` varchar(255) DEFAULT NULL,
  `deputyId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table instance
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `instance` (
  `officialId` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `typeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`officialId`),
  UNIQUE KEY `officialId` (`officialId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table instancetype
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `instancetype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `singular` varchar(255) DEFAULT NULL,
  `plural` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table mandate
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `mandate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` longtext,
  `startingDate` varchar(255) DEFAULT NULL,
  `endingDate` varchar(255) DEFAULT NULL,
  `deputyId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table role
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roleTypeId` int(11) DEFAULT NULL,
  `deputyId` int(11) DEFAULT NULL,
  `instanceId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table roletype
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roletype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `maleName` varchar(255) DEFAULT NULL,
  `femaleName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table shorttheme
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `shorttheme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) DEFAULT NULL,
  `shortName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `fullName` (`fullName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table subscriber
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `subscriber` (
  `instanceId` varchar(255) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`instanceId`),
  UNIQUE KEY `instanceId` (`instanceId`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table subtheme
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `subtheme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `themeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table theme
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `theme` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `typeName` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table vote
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `vote` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` varchar(255) DEFAULT NULL,
  `ballotId` int(11) DEFAULT NULL,
  `deputyId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



# Affichage de la table work
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `work` (
  `createdAt` varchar(255) DEFAULT NULL,
  `updatedAt` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` longtext,
  `tempTheme` varchar(255) DEFAULT NULL,
  `originalThemeName` varchar(255) DEFAULT NULL,
  `date` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `description` longtext,
  `type` varchar(255) DEFAULT NULL,
  `themeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`),
  UNIQUE KEY `url` (`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;




/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
