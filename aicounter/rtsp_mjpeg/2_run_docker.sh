#!/bin/bash

sudo docker run -d --name rtsp_mjpeg --network host --restart unless-stopped --mount type=bind,source="$(pwd)",target=/app rtsp_mjpeg