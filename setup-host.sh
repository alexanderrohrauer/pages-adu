cd ~
mkdir pages
cd pages
mkdir config
wget https://raw.githubusercontent.com/alexanderrohrauer/pages-adu/refs/heads/main/deployment-targets/docker/config/config.js -O ./config/config.js
wget https://raw.githubusercontent.com/alexanderrohrauer/pages-adu/refs/heads/main/deployment-targets/docker/docker-compose.yml
DOCKER_GROUP_GID=$(stat -c '%g' /var/run/docker.sock)
echo "export DOCKER_GROUP_GID=$DOCKER_GROUP_GID;" >> "$HOME/.bashrc"
export DOCKER_GROUP_GID=$DOCKER_GROUP_GID
touch .env
nano .env