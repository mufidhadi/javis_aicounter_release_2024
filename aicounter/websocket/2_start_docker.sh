#!/bin/bash
sudo docker run -d --name ws1 --network host --restart unless-stopped ws_1
sudo docker run -d --name ws2 --network host --restart unless-stopped ws_2
