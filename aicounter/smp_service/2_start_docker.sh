#!/bin/bash

sudo docker stop smp_service
sudo docker rm smp_service

sudo docker run -d --name smp_service --network host --restart unless-stopped smp_service