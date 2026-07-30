cd ~
mkdir pages
cd pages
mkdir config
wget https://raw.githubusercontent.com/alexanderrohrauer/pages-adu/refs/heads/main/deployment-targets/docker/config/config.js -O ./config/config.js
wget https://raw.githubusercontent.com/alexanderrohrauer/pages-adu/refs/heads/main/deployment-targets/docker/docker-compose.yml
touch .env
nano .env