#!/bin/bash
export PATH=$PATH:/usr/local/bin
export NODE_PATH=/usr/local/share/node
export USER=ubuntu
export HOME=/home/ubuntu
source $HOME/.nvm/nvm.sh

sudo kill -9 $(sudo lsof -t -i:3000)

echo "##### Starting API #####"
/usr/bin/env node app.js
