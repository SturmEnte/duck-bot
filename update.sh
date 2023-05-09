#! /bin/bash
git pull
npm i
npm run build
cd build
docker build -t duck-bot .