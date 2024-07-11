USE aicounter_db;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE camera_log;
TRUNCATE TABLE camera_list;
TRUNCATE TABLE device_camera;
TRUNCATE TABLE device;
TRUNCATE TABLE ruas_data;
TRUNCATE TABLE ruas;
TRUNCATE TABLE simpang_kaki_hitung;
TRUNCATE TABLE simpang_kaki_data;
TRUNCATE TABLE simpang_kaki;
TRUNCATE TABLE simpang;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO device (id,name,processor,ip,yolo_model) VALUES (7,"orin tes meja 1","jetson","192.168.0.237","jv_indo_n.pt");
INSERT INTO camera_list (id,name,lat,lng,rtsp) VALUES ("14","patuk gunung kidul","null","null","https://stream.gunungkidulkab.go.id:8443/live/58328653-bae9-4e69-82d0-b83d500040b1.flv");
INSERT INTO device_camera (device_id,camera_id,is_set_to_run,jenis_jalan) VALUES (7,14,"Y","ruas_dalam_kota");
INSERT INTO ruas (id,id_camera,nama,lat,lng) VALUES ("3","14","patuk gunung kidul","0","0");
