use aicounter_db;

ALTER TABLE `camera_list`
	ADD COLUMN `output_res` ENUM('240p','360p','480p','720p') NULL DEFAULT '240p' AFTER `rtsp`;