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


-- Dumping database structure for aicounter_db
CREATE DATABASE IF NOT EXISTS `aicounter_db` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `aicounter_db`;

-- Dumping structure for table aicounter_db.camera_list
CREATE TABLE IF NOT EXISTS `camera_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `rtsp` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.camera_list: ~18 rows (approximately)
DELETE FROM `camera_list`;
/*!40000 ALTER TABLE `camera_list` DISABLE KEYS */;
INSERT INTO `camera_list` (`id`, `name`, `lat`, `lng`, `rtsp`) VALUES
	(1, 'maguwo utara', '-7.7833807', '110.4292203', 'rtsp://root:JTAlbarokah313@172.16.20.134:554/live1s3.sdp'),
	(2, 'maguwo timur', '-7.7835247', '110.4292933', 'rtsp://root:JTAlbarokah313@172.16.20.135:554/live1s3.sdp'),
	(3, 'maguwo barat', '-7.7834207', '110.4290623', 'rtsp://root:JTAlbarokah313@172.16.20.136:554/live1s3.sdp'),
	(4, 'gamping selatan', '-7.8006117', '110.3251175', 'rtsp://root:JTAlbarokah313@172.16.21.131:554/live1s3.sdp'),
	(5, 'gamping barat', '-7.8004107', '110.3243243', 'rtsp://root:JTAlbarokah313@172.16.21.132:554/live1s3.sdp'),
	(6, 'gamping timur', '-7.8004117', '110.3247163', 'rtsp://root:JTAlbarokah313@172.16.21.145:554/live1s3.sdp'),
	(7, 'bandara ruas', NULL, NULL, 'rtsp://172.16.1.25:3454/Media/Live/Normal?camera=C_20&streamindex=1'),
	(8, 'maguwo timur ruas', '-7.7835247', '110.4292933', 'rtsp://root:JTAlbarokah313@172.16.20.135:554/live1s3.sdp'),
	(9, 'palimanan 1', NULL, NULL, 'rtsp://cctv:AtmsJavis22@10.21.32.11/Streaming/Channels/102'),
	(10, 'palimanan 2', NULL, NULL, 'rtsp://cctv:AtmsJavis22@10.21.32.9/Streaming/Channels/102'),
	(11, 'palimanan 3', NULL, NULL, 'rtsp://cctv:AtmsJavis22@10.21.32.8/Streaming/Channels/102'),
	(12, 'palimanan 4', NULL, NULL, 'rtsp://cctv:AtmsJavis22@10.21.32.10/Streaming/Channels/102'),
	(13, 'bulakamba', NULL, NULL, 'rtsp://cctv:AtmsJavis22@10.21.33.53/Streaming/Channels/102'),
	(14, 'patuk gunung kidul', NULL, NULL, 'https://stream.gunungkidulkab.go.id:8443/live/58328653-bae9-4e69-82d0-b83d500040b1.flv'),
	(15, 'tempel', NULL, NULL, 'rtsp://cctv:JTAlbarokah313@172.16.15.117:554/live3.sdp'),
	(16, 'gamping (ruas)', NULL, NULL, 'rtsp://root:JTAlbarokah313@172.16.21.154:554/live1s3.sdp'),
	(17, 'prambanan', NULL, NULL, 'rtsp://root:JTAlbarokah313@172.16.20.111:554/live1s3.sdp'),
	(18, 'demen glagah', NULL, NULL, 'rtsp://root:JTAlbarokah313@172.16.20.137:554/live1s3.sdp');
/*!40000 ALTER TABLE `camera_list` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.camera_log
CREATE TABLE IF NOT EXISTS `camera_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `camera_id` int(11) DEFAULT NULL,
  `sm` int(11) DEFAULT NULL,
  `sm_in` int(11) DEFAULT NULL,
  `sm_out` int(11) DEFAULT NULL,
  `mp` int(11) DEFAULT NULL,
  `mp_in` int(11) DEFAULT NULL,
  `mp_out` int(11) DEFAULT NULL,
  `ks` int(11) DEFAULT NULL,
  `ks_in` int(11) DEFAULT NULL,
  `ks_out` int(11) DEFAULT NULL,
  `ks_t_in` int(11) DEFAULT NULL,
  `ks_t_out` int(11) DEFAULT NULL,
  `ks_b_in` int(11) DEFAULT NULL,
  `ks_b_out` int(11) DEFAULT NULL,
  `bb` int(11) DEFAULT NULL,
  `bb_in` int(11) DEFAULT NULL,
  `bb_out` int(11) DEFAULT NULL,
  `tb` int(11) DEFAULT NULL,
  `tb_in` int(11) DEFAULT NULL,
  `tb_out` int(11) DEFAULT NULL,
  `smp` float DEFAULT NULL,
  `smp_in` float DEFAULT NULL,
  `smp_out` float DEFAULT NULL,
  `waktu` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping structure for table aicounter_db.device
CREATE TABLE IF NOT EXISTS `device` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `processor` enum('vga','cpu','jetson') DEFAULT NULL,
  `ip` varchar(25) DEFAULT '172.0.0.1',
  `yolo_model` varchar(25) DEFAULT 'yolov8n.pt',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.device: ~6 rows (approximately)
DELETE FROM `device`;
/*!40000 ALTER TABLE `device` DISABLE KEYS */;
INSERT INTO `device` (`id`, `name`, `processor`, `ip`, `yolo_model`) VALUES
	(1, 'pc vga rnd', 'vga', '172.29.109.20', 'jv_indo_m.pt'),
	(2, 'laptop mufid', 'cpu', '172.29.141.29', 'jv_indo_n.pt'),
	(3, 'orin nano miniPC (172.29.161.168)', 'jetson', '192.168.0.189', 'jv_indo_n.pt'),
	(4, 'detector lebaran dishub jogja', 'vga', '172.29.109.20', 'jv_indo_n.pt'),
	(5, 'orin nano CCROOM', NULL, '172.0.0.1', 'jv_indo_n.pt'),
	(6, 'orin nx CCROOM', 'jetson', '172.29.94.43', 'jv_indo_n.pt');
/*!40000 ALTER TABLE `device` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.device_camera
CREATE TABLE IF NOT EXISTS `device_camera` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) DEFAULT NULL,
  `camera_id` int(11) DEFAULT NULL,
  `is_set_to_run` enum('Y','N') DEFAULT 'Y',
  `jenis_jalan` enum('simpang','ruas_dalam_kota','ruas_luar_kota') DEFAULT 'simpang',
  PRIMARY KEY (`id`),
  KEY `camera_id` (`camera_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `FK_device_camera_camera_list` FOREIGN KEY (`camera_id`) REFERENCES `camera_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_device_camera_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.device_camera: ~13 rows (approximately)
DELETE FROM `device_camera`;
/*!40000 ALTER TABLE `device_camera` DISABLE KEYS */;
INSERT INTO `device_camera` (`id`, `device_id`, `camera_id`, `is_set_to_run`, `jenis_jalan`) VALUES
	(1, 1, 1, 'Y', 'simpang'),
	(2, 1, 2, 'Y', 'simpang'),
	(3, 1, 3, 'Y', 'simpang'),
	(4, 1, 8, 'Y', 'ruas_dalam_kota'),
	(6, 3, 14, 'Y', 'ruas_dalam_kota'),
	(7, 4, 8, 'Y', 'ruas_dalam_kota'),
	(8, 4, 16, 'Y', 'ruas_dalam_kota'),
	(9, 4, 14, 'Y', 'ruas_dalam_kota'),
	(10, 4, 15, 'Y', 'ruas_dalam_kota'),
	(11, 6, 14, 'Y', 'ruas_dalam_kota'),
	(12, 6, 15, 'Y', 'ruas_dalam_kota'),
	(13, 6, 17, 'Y', 'ruas_dalam_kota'),
	(14, 6, 18, 'Y', 'ruas_dalam_kota');
/*!40000 ALTER TABLE `device_camera` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.hitungan_log_perjam
CREATE TABLE IF NOT EXISTS `hitungan_log_perjam` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `c_kaki_simpang` float DEFAULT NULL,
  `j_kaki_simpang` float DEFAULT NULL,
  `smp` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.hitungan_log_perjam: ~0 rows (approximately)
DELETE FROM `hitungan_log_perjam`;
/*!40000 ALTER TABLE `hitungan_log_perjam` DISABLE KEYS */;
/*!40000 ALTER TABLE `hitungan_log_perjam` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.ruas
CREATE TABLE IF NOT EXISTS `ruas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_camera` int(11) DEFAULT NULL,
  `nama` varchar(50) NOT NULL DEFAULT '0',
  `lat` varchar(50) NOT NULL DEFAULT '0',
  `lng` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_camera` (`id_camera`),
  CONSTRAINT `FK_ruas_camera_list` FOREIGN KEY (`id_camera`) REFERENCES `camera_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.ruas: ~7 rows (approximately)
DELETE FROM `ruas`;
/*!40000 ALTER TABLE `ruas` DISABLE KEYS */;
INSERT INTO `ruas` (`id`, `id_camera`, `nama`, `lat`, `lng`) VALUES
	(1, 8, 'maguwo timur', '-7.7835247', '110.4292933'),
	(2, 13, 'palimanan', '0', '0'),
	(3, 14, 'patuk gunung kidul', '0', '0'),
	(4, 16, 'gamping', '0', '0'),
	(5, 15, 'tempel', '0', '0'),
	(6, 17, 'prambanan', '0', '0'),
	(7, 18, 'demen glagah', '0', '0');
/*!40000 ALTER TABLE `ruas` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.ruas_data
CREATE TABLE IF NOT EXISTS `ruas_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_ruas` int(11) NOT NULL,
  `tipe_jalan` enum('searah','1/1','2/1','2/2-t','2/2-tt','4/2-t','4/2-tt','6/2-t','8/2-t') NOT NULL,
  `lebar_jalur` float NOT NULL,
  `pemisah_arah` enum('50-50','55-45','60-40','65-35','70-30') NOT NULL,
  `kelas_hambatan_samping` enum('sangat_rendah','rendah','sedang','tinggi','sangat_tinggi') NOT NULL,
  `lebar_bahu_efektif` float NOT NULL,
  `jenis_bahu_atau_kereb` enum('berbahu','berkereb') NOT NULL,
  `ukuran_kota` enum('sangat_kecil','kecil','sedang','besar','sangat_besar') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ruas_id` (`id_ruas`),
  CONSTRAINT `FK_ruas_data_ruas` FOREIGN KEY (`id_ruas`) REFERENCES `ruas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.ruas_data: ~2 rows (approximately)
DELETE FROM `ruas_data`;
/*!40000 ALTER TABLE `ruas_data` DISABLE KEYS */;
INSERT INTO `ruas_data` (`id`, `id_ruas`, `tipe_jalan`, `lebar_jalur`, `pemisah_arah`, `kelas_hambatan_samping`, `lebar_bahu_efektif`, `jenis_bahu_atau_kereb`, `ukuran_kota`) VALUES
	(1, 1, '4/2-t', 3.5, '50-50', 'sangat_rendah', 1.5, 'berkereb', 'sedang'),
	(2, 2, '4/2-t', 4, '50-50', 'rendah', 1.5, 'berbahu', 'sedang');
/*!40000 ALTER TABLE `ruas_data` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.simpang
CREATE TABLE IF NOT EXISTS `simpang` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(50) NOT NULL DEFAULT '0',
  `lat` varchar(50) NOT NULL DEFAULT '0',
  `lng` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.simpang: ~3 rows (approximately)
DELETE FROM `simpang`;
/*!40000 ALTER TABLE `simpang` DISABLE KEYS */;
INSERT INTO `simpang` (`id`, `nama`, `lat`, `lng`) VALUES
	(1, 'maguwo', '-7.7834537', '110.4291453'),
	(2, 'gamping', '-7.8004087', '110.3245143'),
	(3, 'palimanan', '0', '0');
/*!40000 ALTER TABLE `simpang` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.simpang_kaki
CREATE TABLE IF NOT EXISTS `simpang_kaki` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_simpang` int(11) DEFAULT NULL,
  `id_camera_utama` int(11) DEFAULT NULL,
  `id_camera_kanan` int(11) DEFAULT NULL,
  `id_camera_kiri` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.simpang_kaki: ~6 rows (approximately)
DELETE FROM `simpang_kaki`;
/*!40000 ALTER TABLE `simpang_kaki` DISABLE KEYS */;
INSERT INTO `simpang_kaki` (`id`, `id_simpang`, `id_camera_utama`, `id_camera_kanan`, `id_camera_kiri`) VALUES
	(1, 1, 1, 3, 2),
	(2, 1, 2, 1, NULL),
	(3, 1, 3, NULL, 1),
	(4, 2, 4, 6, 5),
	(5, 2, 5, 4, NULL),
	(6, 2, 6, NULL, 4);
/*!40000 ALTER TABLE `simpang_kaki` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.simpang_kaki_data
CREATE TABLE IF NOT EXISTS `simpang_kaki_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_simpang_kaki` int(11) DEFAULT NULL,
  `waktu_hijau` int(11) DEFAULT NULL,
  `total_siklus` int(11) DEFAULT NULL,
  `tipe_lingkungan` enum('komersial','permukiman','akses terbatas') DEFAULT NULL,
  `tipe_fase` enum('terlawan','terlindung') DEFAULT NULL,
  `jumlah_juta_penduduk_kota` float DEFAULT NULL,
  `tipe_hambatan_samping` enum('tinggi','sedang','rendah') DEFAULT NULL,
  `lebar_efektif_pendekat` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_simpang_kaki` (`id_simpang_kaki`),
  CONSTRAINT `FK_simpang_kaki_data_simpang_kaki` FOREIGN KEY (`id_simpang_kaki`) REFERENCES `simpang_kaki` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- Dumping data for table aicounter_db.simpang_kaki_data: ~3 rows (approximately)
DELETE FROM `simpang_kaki_data`;
/*!40000 ALTER TABLE `simpang_kaki_data` DISABLE KEYS */;
INSERT INTO `simpang_kaki_data` (`id`, `id_simpang_kaki`, `waktu_hijau`, `total_siklus`, `tipe_lingkungan`, `tipe_fase`, `jumlah_juta_penduduk_kota`, `tipe_hambatan_samping`, `lebar_efektif_pendekat`) VALUES
	(1, 2, 10, 39, 'komersial', 'terlawan', 0.4, 'sedang', 5),
	(2, 1, 10, 39, 'komersial', 'terlindung', 0.4, 'sedang', 5),
	(3, 1, 15, 55, 'komersial', 'terlindung', 2.9, 'rendah', 4);
/*!40000 ALTER TABLE `simpang_kaki_data` ENABLE KEYS */;

-- Dumping structure for table aicounter_db.simpang_kaki_hitung
CREATE TABLE IF NOT EXISTS `simpang_kaki_hitung` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_kaki_simpang` int(11) DEFAULT NULL,
  `smp_out` float DEFAULT NULL,
  `smp_kiri` float DEFAULT NULL,
  `smp_kanan` float DEFAULT NULL,
  `waktu` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_kaki_simpang` (`id_kaki_simpang`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
