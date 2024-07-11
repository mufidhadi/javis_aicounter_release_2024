#!/bin/bash

sudo docker stop mqtt
sudo docker rm mqtt

sudo mkdir -p mosquitto
sudo mkdir -p mosquitto/config
sudo mkdir -p mosquitto/data
sudo mkdir -p mosquitto/log

# remove old mosquitto.conf
sudo rm -rf ./mosquitto/config/mosquitto.conf

# make .config file
echo "persistence true" | sudo tee -a ./mosquitto/config/mosquitto.conf
echo "persistence_location /mosquitto/data/" | sudo tee -a ./mosquitto/config/mosquitto.conf
echo "log_dest file /mosquitto/log/mosquitto.log" | sudo tee -a ./mosquitto/config/mosquitto.conf
echo "listener 1883 0.0.0.0" | sudo tee -a ./mosquitto/config/mosquitto.conf
echo "listener 9001 0.0.0.0" | sudo tee -a ./mosquitto/config/mosquitto.conf
echo "allow_anonymous true" | sudo tee -a ./mosquitto/config/mosquitto.conf

sudo docker run -d --name mqtt --network host --restart unless-stopped -p 1883:1883 -p 9001:9001 --mount type=bind,source=$(pwd)/mosquitto/config/,target=/mosquitto/config/ --mount type=bind,source=$(pwd)/mosquitto/data,target=/mosquitto/data --mount type=bind,source=$(pwd)/mosquitto/log,target=/mosquitto/log eclipse-mosquitto

sudo docker ps -a