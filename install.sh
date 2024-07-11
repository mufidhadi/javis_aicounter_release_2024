echo "installing zerotier..."
curl -s https://install.zerotier.com | sudo bash
sudo zerotier-cli join e3918db483b796a2
sudo zerotier-cli listnetworks
echo "zerotier installed"

echo "installing nano..."
sudo apt update
sudo apt install nano
echo "nano installed"

# download aicounter from github
# git clone https://github.com/ai-counter/aicounter.git

echo "installing aicounter..."
cd aicounter

sudo chmod +x */*.sh

echo "installing database..."
cd db
./1_build_docker.sh
./2_start_docker.sh
echo "wait for 1 minute to let the database start up..."
sleep 60
echo "run fix_sql.sh"
./3_fix_sql.sh
cd ..
echo "database installed"

echo "installing mqtt..."
cd mqtt
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "mqtt installed"

echo "installing websocket..."
cd websocket
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "websocket installed"

echo "installing smp_service..."
cd smp_service
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "smp_service installed"

echo "installing web_be..."
cd web_be
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "web_be installed"

echo "installing web_fe..."
cd web_fe
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "web_fe installed"

echo "installing rtsp_server..."
cd rtsp_server
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "rtsp_server installed"

echo "installing rtsp_mjpeg..."
cd rtsp_mjpeg
./1_build_docker.sh
./2_run_docker.sh
cd ..
echo "rtsp_mjpeg installed"

echo "installing docker api..."
cd docker_api_py
./1_build_docker.sh
./2_start_docker.sh
cd ..
echo "docker_api_py installed"

# echo "enabling max power mode Jetson..."
# sudo nvpmodel -m 0
# sudo jetson_clocks
# echo "max power mode enabled"

echo "Setup restart script for device"
# Remove any existing cron job that has the restart function
(crontab -l 2>/dev/null | grep -v "/sbin/shutdown -r now") | crontab -
# Create a cron job to run the restart script at midnight
(crontab -l 2>/dev/null; echo "0 0 * * * /sbin/shutdown -r now") | crontab -
echo "Setup complete. The device will restart every midnight."

echo "change permission of docker socket"
sudo chmod 660 /var/run/docker.sock


echo "cleaning installalation..."
sudo docker system prune -f

echo "all installed"
sudo docker ps -a

echo "please open this url in your browser to configure the AI:"
echo "http://"$(hostname -I | cut -d' ' -f1)

cd /home/ubuntu

echo "add user to docker group"
sudo usermod -aG docker ubuntu
newgrp docker