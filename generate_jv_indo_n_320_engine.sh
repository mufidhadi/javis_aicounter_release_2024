#!/bin/bash

sudo docker run -it --network host --restart unless-stopped --gpus all --runtime nvidia --mount type=bind,source=/home/ubuntu/aicounter/ai,target=/home -w/home ultralytics/ultralytics:latest-jetson yolo export model=jv_indo_n.pt format=engine imgsz=320

mv /home/ubuntu/aicounter/ai/jv_indo_n.engine /home/ubuntu/aicounter/ai/jv_indo_n_320.engine

echo "selesai generate jv_indo_n_320.engine"