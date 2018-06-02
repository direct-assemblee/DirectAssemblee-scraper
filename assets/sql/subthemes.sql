SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE TABLE IF NOT EXISTS `subtheme` (
  `id` int(4) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `themeId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 AUTO_INCREMENT=107;

INSERT IGNORE `subtheme` (`id`, `name`, `themeId`) VALUES
(1, "Affaires étrangères", 1),
(2, "Chambres consulaires", 1),
(3, "Français de l'étranger", 1),
(4, "Organisations internationales", 1),
(5, "Politique extérieure", 1),
(6, "Relations internationales", 1),
(7, "Ambassades et consulats", 1),

(8, "Agriculture", 2),
(9, "Agroalimentaire", 2),
(10, "Aquaculture et pêche professionnelle", 2),
(11, "Élevage", 2),
(12, "La place du traitement massif des données (big data) dans l'agriculture", 2),

(13, "Aménagement du territoire", 3),
(14, "Communes", 3),
(15, "Coopération intercommunale", 3),
(16, "Départements", 3),
(17, "Régions", 3),
(18, "Intercommunalité", 3),
(19, "Ruralité", 3),

(20, "Anciens combattants", 4),
(21, "Anciens combattants et victimes de guerre", 4),

(22, "Budget", 5),
(23, "Coût de la fermeture anticipée de réacteurs nucléaires", 5),
(24, "Politique économique", 5),

(25, "Collectivités territoriales", 6),

(26, "Arts et spectacles", 7),
(27, "Audiovisuel et communication", 7),
(28, "Culture", 7),
(29, "Nouvelle chaîne publique d'information en continu", 7),
(30, "Patrimoine culturel", 7),
(31, "Presse et livres", 7),
(32, "Propriété intellectuelle", 7),

(33, "Brouillage des communications électroniques", 8),
(34, "Défense", 8),

(35, "Banques et établissements financiers", 9),
(36, "Contributions indirectes", 9),
(37, "Croissance, activité et égalité des chances économiques - motion de censure", 9),
(38, "Donations et successions", 9),
(39, "Economie", 9),
(40, "Économie sociale", 9),
(41, "Économie sociale et solidaire", 9),
(42, "Enregistrement et timbre", 9),
(43, "Impôt de solidarité sur la fortune", 9),
(44, "Impôt sur le revenu", 9),
(45, "Impôt sur les sociétés", 9),
(46, "Impôts et taxes", 9),
(47, "Impôts locaux", 9),
(48, "L'aide publique au développement", 9),
(49, "Marchés financiers", 9),
(50, "Marchés publics", 9),
(51, "Moyens de paiement", 9),
(52, "Plus-values : imposition", 9),
(53, "TVA", 9),
(54, "Taxe sur la valeur ajoutée", 9),

(55, "Bourses d'études", 10),
(56, "Démocratisation d'Erasmus", 10),
(57, "Education", 10),
(58, "Éducation physique et sportive", 10),
(59, "Enseignement", 10),
(60, "Enseignement agricole", 10),
(61, "Enseignement maternel et primaire", 10),
(62, "Enseignement privé", 10),
(63, "Enseignement secondaire", 10),
(64, "Enseignement supérieur", 10),
(65, "Enseignement technique et professionnel", 10),
(66, "Enseignements artistiques", 10),
(67, "Grandes écoles", 10),
(68, "Examens, concours et diplômes", 10),

(69, "Energie", 11),
(70, "Énergie et carburants", 11),
(71, "Nouvelles données de la géopolitique de l'énergie", 11),
(72, "Tournant énergétique allemand", 11),

(73, "Entreprises", 12),
(74, "Bâtiment et travaux publics", 12),
(75, "Hôtellerie et restauration", 12),
(76, "Industrie", 12),
(77, "Informatique", 12),
(78, "Mines et carrières", 12),
(79, "Sociétés", 12),
(80, "Tourisme et loisirs", 12),

(81, "Environnement", 13),
(82, "Bois et forêts", 13),
(83, "Chasse et pêche", 13),
(84, "Climat", 13),
(85, "Cours d'eau, étangs et lacs", 13),
(86, "De la biomasse à la bioéconomie", 13),
(87, "Déchets", 13),
(88, "Déchets, pollution et nuisances", 13),
(89, "Développement durable", 13),
(90, "Eau", 13),
(91, "Evènements climatiques extrêmes", 13),
(92, "Innovation et changement climatique", 13),
(93, "L'hydrogène", 13),
(94, "La filière semencière française", 13),
(95, "Mer et littoral", 13),
(96, "Nouvelles mobilités sereines et durables", 13),
(97, "Produits dangereux", 13),
(98, "Techniques alternatives à la fracturation hydraulique pour l'exploration et l'exploitation des hydrocarbures non conventionnels", 13),
(99, "Catastrophes naturelles", 13),
(100, "Eau et assainissement", 13),
(101, "Pollution", 13),
(102, "Montagne", 13),
(103, "Biodiversité", 13),

(104, "Famille", 14),
(105, "Enfants", 14),

(106, "Fonction publique", 15),
(107, "Administration", 15),
(108, "Enseignement : personnel", 15),
(109, "Enseignement maternel et primaire : personnel", 15),
(110, "Enseignement secondaire : personnel", 15),
(111, "Enseignement supérieur : personnel", 15),
(112, "État civil", 15),
(113, "Finances publiques", 15),
(114, "Fonction publique de l'État", 15),
(115, "Fonction publique hospitalière", 15),
(116, "Fonction publique territoriale", 15),
(117, "Fonctionnaires et agents publics", 15),
(118, "Papiers d'identité", 15),
(119, "Services", 15),
(120, "Services publics", 15),

(121, "Justice", 16),
(122, "Droit pénal", 16),
(123, "Saisies et sûretés", 16),
(124, "Système pénitentiaire ", 16),
(125, "Traitement pénal de l'évasion fiscale", 16),
(126, "Crimes, délits et contraventions", 16),
(127, "Lieux de privation de liberté", 16),

(128, "Logement et urbanisme", 17),
(129, "Architecture", 17),
(130, "Baux", 17),
(131, "Copropriété", 17),
(132, "Logement", 17),
(133, "Logement : aides et prêts", 17),
(134, "Urbanisme", 17),
(135, "Voirie", 17),

(136, "Outre-mer", 18),

(137, "Commerce et artisanat", 19),
(138, "Commerce extérieur", 19),
(139, "Ventes et échanges", 19),
(140, "PME et artisanat", 19),
(141, "PME, commerce et artisanat", 19),

(142, "Police et sécurité", 20),
(143, "Armes", 20),
(144, "Gendarmerie", 20),
(145, "Le contrôle des équipements sous pression nucléaires", 20),
(146, "Ordre public", 20),
(147, "Police", 20),
(148, "Sécurité numérique et risque", 20),
(149, "Sécurité publique", 20),
(150, "Sécurité routière", 20),
(151, "Sécurité des biens et des personnes", 20),
(152, "Terrorisme", 20),
(153, "Nuisances", 20),
(154, "Sécurité civile", 20),

(155, "Pouvoirs publics", 21),
(156, "Constitution", 21),
(157, "Déchéances et incapacités", 21),
(158, "Décorations, insignes et emblèmes", 21),
(159, "Élections et référendums", 21),
(160, "État", 21),
(161, "Ministères et secrétariats d'État", 21),
(162, "Nationalité", 21),
(163, "Parlement", 21),
(164, "Règles applicables à l'élection présidentielle", 21),
(165, "Secteur public", 21),
(166, "Élus", 21),
(167, "Gouvernement", 21),
(168, "Laïcité",  21),

(169, "Questions sociales et santé", 22),
(170, "Assurances", 22),
(171, "Avortement", 22),
(172, "Bioéthique", 22),
(173, "Chômage", 22),
(174, "Chômage : indemnisation", 22),
(175, "Drogue", 22),
(176, "Établissements de santé", 22),
(177, "Greffes d'organes", 22),
(178, "Handicapés", 22),
(179, "Institutions sociales et médico-sociales", 22),
(180, "Institutions sociales et médico sociales", 22),
(181, "Pharmacie et médicaments", 22),
(182, "Politique sociale", 22),
(183, "Sang et organes humains", 22),
(184, "Santé", 22),
(185, "Santé mentale et avenir de la psychiatrie", 22),
(186, "Adjuvants vaccinaux", 22),
(187, "Aide aux victimes", 22),
(188, "Assurance complémentaire", 22),
(189, "Dépendance", 22),
(190, "Maladies", 22),
(191, "Médecine", 22),
(192, "Pauvreté", 22),
(193, "Personnes handicapées", 22),
(194, "Régime social des indépendants", 22),
(195, "Alcools et boissons alcoolisées", 22),
(196, "Fin de vie et soins palliatifs", 22),
(197, "Interruption volontaire de grossesse", 22),

(198, "Recherche, sciences et techniques", 23),
(199, "Espace", 23),
(200, "Faire connaître et partager les cultures scientifiques, techniques et industrielles", 23),
(201, "Recherche", 23),
(202, "Espace et politique spatiale", 23),
(203, "Recherche et innovation", 23),

(204, "Sécurité sociale", 24),
(205, "Assurance invalidité décès", 24),
(206, "Assurance maladie maternité", 24),
(207, "Assurance maladie maternité : généralités", 24),
(208, "Assurance maladie maternité : prestations", 24),
(209, "Prestations familiales", 24),
(210, "Assurance maladie maternité", 24),

(211, "Animaux", 25),
(212, "Associations", 25),
(213, "Cérémonies publiques et fêtes légales", 25),
(214, "Démographie", 25),
(215, "Droits fondamentaux", 25),
(216, "Droits de l'Homme et libertés publiques", 25),
(217, "Consommation", 25),
(218, "Cultes", 25),
(219, "Discriminations", 25),
(220, "Ésotérisme", 25),
(221, "Étrangers", 25),
(222, "Femmes", 25),
(223, "Frontaliers", 25),
(224, "Gens du voyage", 25),
(225, "Immigration", 25),
(226, "Jeunes", 25),
(227, "Jeux et paris", 25),
(228, "Matières premières", 25),
(229, "Mort", 25),
(230, "Numérique et libertés", 25),
(231, "Personnes âgées", 25),
(232, "Politiques communautaires", 25),
(233, "Postes", 25),
(234, "Préretraites", 25),
(235, "Propriété", 25),
(236, "Publicité", 25),
(237, "Rapatriés", 25),
(238, "Retraites : fonctionnaires civils et militair", 25),
(239, "Retraites : généralités", 25),
(240, "Retraites : régime agricole", 25),
(241, "Retraites : régime général", 25),
(242, "Retraites : régimes autonomes et spéciaux", 25),
(243, "Société", 25),
(244, "Télécommunications", 25),
(245, "Associations et fondations", 25),
(246, "Égalité des sexes et parité", 25),
(247, "Internet", 25),
(248, "Mort et décès", 25),
(249, "Numérique", 25),
(250, "Réfugiés et apatrides", 25),
(251, "Religions et cultes", 25),

(252, "Sports", 26),

(253, "Traités et conventions", 27),
(254, "Suivi du pacte de croissance", 27),

(255, "Transports", 28),
(256, "Transport", 28),
(257, "Transports urbains", 28),
(258, "Transports routiers", 28),
(259, "Transports par eau", 28),
(260, "Transports ferroviaires", 28),
(261, "Transports aériens", 28),
(262, "Automobiles", 28),
(263, "Automobiles et cycles", 28),
(264, "Cycles et motocycles", 28),
(265, "Cycles et motocycles", 28),
(266, "Automobiles", 28),

(267, "Emploi", 29),
(268, "Formation professionnelle", 29),
(269, "Professions de santé", 29),
(270, "Professions immobilières", 29),
(271, "Professions judiciaires et juridiques", 29),
(272, "Professions libérales", 29),
(273, "Professions sociales", 29),
(274, "Risques professionnels", 29),
(275, "Syndicats", 29),
(276, "Taxis", 29),
(277, "Travail", 29),
(278, "Travailleurs indépendants et autoentrepreneur", 29),
(279, "Travail et emploi", 29),
(280, "Emploi et activité", 29),
(281, "Formation professionnelle et apprentissage", 29),
(282, "Professions et activités immobilières", 29),
(283, "Professions et activités sociales", 29),
(284, "Illettrisme", 29),
(285, "Langue française", 29),

(286, "Union européenne", 30),
(287, "Semestre européen 2017 ", 30),
(288, "Plan Juncker", 30),
(289, "Impact de la législation européenne en matière de services publics", 30),

(290, "Politique générale", 31),

(291, "Archives et bibliothèques", 7),
(292, "Services à la personne", 22),
(293, "Mutualité sociale agricole", 24),
(294, "Contraception", 22),
(295, "Médecines alternatives", 22),
(296, "Affaires internationales", 1),
(297, "Commerce, artisanat et PME", 19),
(298, "Commerces, artisanat et PME", 19),
(299, "Impôt sur la fortune immobilière", 9),
(300, "Heure légale", 30),
(301, "Agriculture, pêche et forêt", 2),
(302, "Immigration maîtrisée, droit d'asile effectif et intégration réussie", 25),
(303, "Partis et mouvements politiques", 21),
(304, "PME, commerces et artisanat", 19),
(305, "Engagement associatif", 25),
(306, "Presse en ligne", 7),
(307, "Amélioration de la prestation de compensation du handicap", 22),
(308, "Interdiction du glyphosate", 2),
(309, "Agriculture et forêt", 2);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
