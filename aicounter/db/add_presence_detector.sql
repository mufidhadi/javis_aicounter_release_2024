-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.6.24 - MySQL Community Server (GPL)
-- Server OS:                    Win32
-- HeidiSQL Version:             9.5.0.5196
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

use aicounter_db;

-- Dumping structure for table aicounter_db.presence_detector
DROP TABLE IF EXISTS `presence_detector`;
CREATE TABLE IF NOT EXISTS `presence_detector` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_camera` int(11) DEFAULT NULL,
  `active` enum('Y','N') DEFAULT NULL,
  `direct_pd_id` int(11) DEFAULT NULL,
  `fase` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.presence_detector: ~2 rows (approximately)
/*!40000 ALTER TABLE `presence_detector` DISABLE KEYS */;
INSERT IGNORE INTO `presence_detector` (`id`, `id_camera`, `active`, `direct_pd_id`, `fase`) VALUES
	(1, 14, 'Y', 1, 1),
	(2, 19, 'Y', 2, 1);
/*!40000 ALTER TABLE `presence_detector` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.presence_detector_device
DROP TABLE IF EXISTS `presence_detector_device`;
CREATE TABLE IF NOT EXISTS `presence_detector_device` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `pd_id` int(11) DEFAULT '1',
  `host` varchar(50) DEFAULT 'localhost',
  `mode` enum('gap','ds') DEFAULT 'gap',
  `treshold` float DEFAULT '0.5',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.presence_detector_device: ~0 rows (approximately)
/*!40000 ALTER TABLE `presence_detector_device` DISABLE KEYS */;
INSERT IGNORE INTO `presence_detector_device` (`id`, `device_id`, `pd_id`, `host`, `mode`, `treshold`) VALUES
	(1, 7, 1, 'localhost', 'gap', 0.5);
/*!40000 ALTER TABLE `presence_detector_device` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
