#!/bin/bash

sudo docker stop webview_fe
sudo docker rm webview_fe

# sudo docker run -d --name webview_fe --network host --restart unless-stopped -p 8080:80 webview_fe
sudo docker run -d --name webview_fe --network host --restart unless-stopped webview_fe
# sudo docker run -d --name webview_fe -p 8888:80 webview_fe