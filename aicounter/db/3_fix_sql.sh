sudo docker exec -i mysql mysql -uroot -pasdzxc -e "ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY 'asdzxc';"
sudo docker exec -i mysql mysql -uroot -pasdzxc -e "SET GLOBAL sql_mode = (SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
sudo docker exec -i mysql mysql -uroot -pasdzxc -e "SET SESSION sql_mode = (SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));"
sudo docker exec -i mysql mysql -uroot -pasdzxc -e "SET @@global.time_zone = '+07:00';"
sudo docker exec -i mysql mysql -uroot -pasdzxc -e "SET @@session.time_zone = '+07:00';"

echo "importing database..."
sudo docker exec -i mysql mysql -uroot -pasdzxc < db_testing.sql
sudo docker exec -i mysql mysql -uroot -pasdzxc < add_presence_detector.sql
sudo docker exec -i mysql mysql -uroot -pasdzxc < add_ln_camera_list.sql
sudo docker exec -i mysql mysql -uroot -pasdzxc < add_output_res.sql
echo "database imported"