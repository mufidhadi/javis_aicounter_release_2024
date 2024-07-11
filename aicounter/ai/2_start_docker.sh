#!/bin/bash
sudo docker stop cam14

sudo docker system prune -f

sudo docker run -d --name cam14 --network host --restart unless-stopped --gpus all --runtime nvidia --mount type=bind,source="$(pwd)",target=/tes aicounter 14

sudo docker ps -a
# delete all docker restart cron job
crontab -r
# add cron job to restart every hour with sudo permission
(crontab -l 2>/dev/null; echo "0 * * * * docker restart cam14") | crontab -
