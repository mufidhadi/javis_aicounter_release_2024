#!/bin/bash
sudo docker rm -f cam13_ref

sudo docker run -d --name cam13_ref --network host --restart unless-stopped --gpus all --runtime nvidia --mount type=bind,source="$(pwd)",target=/tes aicounter_ref -i 13 -m ws -debug

sudo docker ps -a

# sudo docker system prune -a -f

# SUDO_PASSWORD="123456"
# ask user to fill the sudo password
# sudo -k
# sudo -p "Please enter the sudo password: " echo
# echo "the password is: $SUDO_PASSWORD"

# add cron job to restart every hour with sudo permission
# (crontab -l 2>/dev/null; echo "0 * * * * sudo docker restart cam14_ref") | crontab -
