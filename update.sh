#! /bin/bash
echo "Starting update"
echo "Pull from GitHub"
git pull
echo "Install npm packages"
npm i
echo "Build application"
npm run build
cd build
echo "Build Docker image"
docker build -t duck-bot .
echo "Updated"