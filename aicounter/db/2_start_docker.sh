#!/bin/bash

sudo docker stop mysql
sudo docker rm mysql

# delete volume
sudo docker volume rm mysql
sudo docker volume create mysql

sudo docker run --name mysql -d --network host -v mysql:/var/lib/mysql --restart unless-stopped -p 3306:3306 -e MYSQL_ROOT_PASSWORD=asdzxc -e MYSQL_ROOT_HOST=% mysql/mysql-server

sudo docker ps -a
