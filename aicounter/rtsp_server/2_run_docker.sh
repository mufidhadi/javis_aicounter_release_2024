#!/bin/bash

sudo docker stop rtsp
sudo docker rm rtsp

sudo docker run -d --name=rtsp --network=host --restart unless-stopped -p 554:554 bluenviron/mediamtx:latest

sudo docker ps -a
