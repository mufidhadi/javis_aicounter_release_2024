-- MySQL dump 10.13  Distrib 5.6.24, for Win32 (x86)
--
-- Host: 192.168.0.247    Database: aicounter_db
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `aicounter_db` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `aicounter_db`;

--
-- Table structure for table `camera_list`
--

DROP TABLE IF EXISTS `camera_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera_list` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `lat` varchar(50) DEFAULT NULL,
  `lng` varchar(50) DEFAULT NULL,
  `rtsp` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `camera_log`
--

DROP TABLE IF EXISTS `camera_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `camera_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `camera_id` int DEFAULT NULL,
  `sm` int DEFAULT NULL,
  `sm_in` int DEFAULT NULL,
  `sm_out` int DEFAULT NULL,
  `mp` int DEFAULT NULL,
  `mp_in` int DEFAULT NULL,
  `mp_out` int DEFAULT NULL,
  `ks` int DEFAULT NULL,
  `ks_in` int DEFAULT NULL,
  `ks_out` int DEFAULT NULL,
  `ks_t_in` int DEFAULT NULL,
  `ks_t_out` int DEFAULT NULL,
  `ks_b_in` int DEFAULT NULL,
  `ks_b_out` int DEFAULT NULL,
  `bb` int DEFAULT NULL,
  `bb_in` int DEFAULT NULL,
  `bb_out` int DEFAULT NULL,
  `tb` int DEFAULT NULL,
  `tb_in` int DEFAULT NULL,
  `tb_out` int DEFAULT NULL,
  `smp` float DEFAULT NULL,
  `smp_in` float DEFAULT NULL,
  `smp_out` float DEFAULT NULL,
  `waktu` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `device`
--

DROP TABLE IF EXISTS `device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `processor` enum('vga','cpu','jetson') DEFAULT NULL,
  `ip` varchar(25) DEFAULT '172.0.0.1',
  `yolo_model` varchar(25) DEFAULT 'jv_indo_n.enggine',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `device_camera`
--

DROP TABLE IF EXISTS `device_camera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `device_camera` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `camera_id` int DEFAULT NULL,
  `is_set_to_run` enum('Y','N') DEFAULT 'Y',
  `jenis_jalan` enum('simpang','ruas_dalam_kota','ruas_luar_kota') DEFAULT 'simpang',
  PRIMARY KEY (`id`),
  KEY `camera_id` (`camera_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `FK_device_camera_camera_list` FOREIGN KEY (`camera_id`) REFERENCES `camera_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_device_camera_device` FOREIGN KEY (`device_id`) REFERENCES `device` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `hitungan_log_perjam`
--

DROP TABLE IF EXISTS `hitungan_log_perjam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hitungan_log_perjam` (
  `id` int NOT NULL AUTO_INCREMENT,
  `c_kaki_simpang` float DEFAULT NULL,
  `j_kaki_simpang` float DEFAULT NULL,
  `smp` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `ruas`
--

DROP TABLE IF EXISTS `ruas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ruas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_camera` int DEFAULT NULL,
  `nama` varchar(50) NOT NULL DEFAULT '0',
  `lat` varchar(50) NOT NULL DEFAULT '0',
  `lng` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_camera` (`id_camera`),
  CONSTRAINT `FK_ruas_camera_list` FOREIGN KEY (`id_camera`) REFERENCES `camera_list` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `ruas_data`
--

DROP TABLE IF EXISTS `ruas_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ruas_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_ruas` int NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `simpang`
--

DROP TABLE IF EXISTS `simpang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `simpang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(50) NOT NULL DEFAULT '0',
  `lat` varchar(50) NOT NULL DEFAULT '0',
  `lng` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `simpang_kaki`
--

DROP TABLE IF EXISTS `simpang_kaki`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `simpang_kaki` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_simpang` int DEFAULT NULL,
  `id_camera_utama` int DEFAULT NULL,
  `id_camera_kanan` int DEFAULT NULL,
  `id_camera_kiri` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `simpang_kaki_data`
--

DROP TABLE IF EXISTS `simpang_kaki_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `simpang_kaki_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_simpang_kaki` int DEFAULT NULL,
  `waktu_hijau` int DEFAULT NULL,
  `total_siklus` int DEFAULT NULL,
  `tipe_lingkungan` enum('komersial','permukiman','akses terbatas') DEFAULT NULL,
  `tipe_fase` enum('terlawan','terlindung') DEFAULT NULL,
  `jumlah_juta_penduduk_kota` float DEFAULT NULL,
  `tipe_hambatan_samping` enum('tinggi','sedang','rendah') DEFAULT NULL,
  `lebar_efektif_pendekat` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_simpang_kaki` (`id_simpang_kaki`),
  CONSTRAINT `FK_simpang_kaki_data_simpang_kaki` FOREIGN KEY (`id_simpang_kaki`) REFERENCES `simpang_kaki` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;


--
-- Table structure for table `simpang_kaki_hitung`
--

DROP TABLE IF EXISTS `simpang_kaki_hitung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `simpang_kaki_hitung` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_kaki_simpang` int DEFAULT NULL,
  `smp_out` float DEFAULT NULL,
  `smp_kiri` float DEFAULT NULL,
  `smp_kanan` float DEFAULT NULL,
  `waktu` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_kaki_simpang` (`id_kaki_simpang`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-11 10:42:26
