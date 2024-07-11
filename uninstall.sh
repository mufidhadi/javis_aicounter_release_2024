echo "start uninstalling all..."

echo "removing docker containers..."
sudo docker rm -f $(sudo docker ps -a -q)

echo "removing docker images..."
sudo docker rmi -f $(sudo docker images -q)

echo "removing docker volumes..."
sudo docker volume rm $(sudo docker volume ls -q)

echo "cleaning docker system..."
sudo docker system prune -a -f

echo "all uninstalled"