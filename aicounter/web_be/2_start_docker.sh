#!/bin/bash

sudo docker stop webview_be
sudo docker rm webview_be

# sudo docker run -d --name webview_be --network host --restart unless-stopped --mount type=bind,source="$(pwd)",target=/app webview_be
sudo docker run -d --name webview_be --network host --restart unless-stopped webview_be