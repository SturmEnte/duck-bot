#! /bin/bash
echo -e "\033[104mStarting update\033[0m"
echo -e "\033[104mPull from GitHub\033[0m"
git pull
echo -e "\033[104mInstall npm packages\033[0m"
npm i
echo -e "\033[104mBuild application\033[0m"
npm run build
cd build
echo -e "\033[104mBuild Docker image\033[0m"
docker build -t duck-bot .
echo -e "\033[104mUpdated\033[0m"