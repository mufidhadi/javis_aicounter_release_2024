#!/bin/bash

sudo docker stop docker_api
sudo docker rm docker_api

sudo docker run -d --name docker_api --network host --restart unless-stopped -v /var/run/docker.sock:/var/run/docker.sock -v /home/ubuntu/aicounter/ai/:/usr/src/app/ai/ docker_api